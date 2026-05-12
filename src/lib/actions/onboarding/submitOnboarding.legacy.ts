"use server";

// =============================================================================
// LEGACY — preservado para rollback de Fase B (refactor a leads).
// Este archivo es una copia exacta del submitOnboarding.ts que estaba en
// producción al cierre de Fase A (commit 2ba9634, 2026-05-12).
// NO está wireado. Ningún módulo lo importa. Si se necesita revertir Fase B:
//   1. Borrar `submitOnboarding.ts`
//   2. Renombrar este archivo: `mv submitOnboarding.legacy.ts submitOnboarding.ts`
//   3. Restaurar el redirect del wizard a `/onboarding/completado` sin query param.
//   4. Restaurar copy original en `(auth)/onboarding/completado/page.tsx`.
// =============================================================================

import { createAdminClient, type AdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  onboardingPayloadSchema,
  PAYMENT_METHOD_LABELS,
  type OnboardingPayload,
} from "@/lib/onboarding/schemas";
import { findAvailableNegocioId } from "@/lib/onboarding/slugify";
import {
  buildPromptFromTemplate,
  formatScheduleAsText,
} from "@/lib/onboarding/promptTemplate";

export type SubmitOnboardingResult =
  | { ok: true }
  | { ok: false; error: string };

const INCONSISTENT_STATE_MESSAGE =
  "Tu cuenta quedó en un estado inconsistente. Por favor escríbenos a mikehuertas91@gmail.com antes de reintentar.";

export async function submitOnboarding(
  input: unknown
): Promise<SubmitOnboardingResult> {
  // 1. Re-validate the full payload server-side. Never trust the client.
  const parsed = onboardingPayloadSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      ok: false,
      error:
        firstIssue?.message ??
        "Algún dato del formulario no es válido. Revisa el formulario y vuelve a intentar.",
    };
  }
  const data: OnboardingPayload = parsed.data;

  // 2. Initialize admin client (service-role). Fails loudly if env not set.
  let admin: AdminClient;
  try {
    admin = createAdminClient();
  } catch (error: unknown) {
    console.error("[onboarding] admin client init failed:", error);
    return {
      ok: false,
      error:
        "Error de configuración del servidor. Avísanos para revisar antes de reintentar.",
    };
  }

  // 3. Generate unique negocio_id from business name with retry on collision.
  let negocioId: string;
  try {
    negocioId = await findAvailableNegocioId(
      data.step1.businessName,
      async (candidateId) => {
        const { data: existing, error } = await admin
          .from("negocios")
          .select("negocio_id")
          .eq("negocio_id", candidateId)
          .maybeSingle();
        if (error) throw error;
        return existing !== null;
      }
    );
  } catch (error: unknown) {
    console.error("[onboarding] slug generation failed:", error);
    return {
      ok: false,
      error: "Confirma un nombre más específico para tu negocio.",
    };
  }

  // 4. Build prompt_sistema text from the full payload.
  const promptSistema = buildPromptFromTemplate(data);

  // 5. Create auth user. After this point any failure requires rollback.
  let authUserId: string;
  try {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: data.step5.email,
      password: data.step5.password,
      email_confirm: true,
    });

    if (error || !created.user) {
      const code = error?.code ?? "";
      const message = (error?.message ?? "").toLowerCase();
      const alreadyExists =
        code === "email_exists" ||
        code === "user_already_exists" ||
        message.includes("already registered") ||
        message.includes("already exists");

      if (alreadyExists) {
        return {
          ok: false,
          error: "Este email ya tiene cuenta. ¿Quieres iniciar sesión?",
        };
      }

      console.error("[onboarding] createUser failed:", error);
      return {
        ok: false,
        error: "No pudimos crear tu cuenta. Intenta de nuevo en un momento.",
      };
    }
    authUserId = created.user.id;
  } catch (error: unknown) {
    console.error("[onboarding] createUser threw:", error);
    return {
      ok: false,
      error: "No pudimos conectar. Intenta de nuevo en un momento.",
    };
  }

  // 6. Insert into negocios. On failure, rollback the auth user.
  const direccionCompleta = `${data.step1.address}, ${data.step1.city}`;
  const horariosTexto = formatScheduleAsText(data.step2.schedule);
  const metodosPagoTexto = data.step4.methods
    .map((method) => PAYMENT_METHOD_LABELS[method])
    .join(", ");
  const menuText = data.step3.menuText.trim() || null;
  const menuImageUrl = data.step3.menuImageUrl || null;

  try {
    const { data: insertedNegocio, error } = await admin
      .from("negocios")
      .insert({
        negocio_id: negocioId,
        nombre_negocio: data.step1.businessName,
        tipo_negocio: data.step1.businessType,
        direccion: direccionCompleta,
        horarios: horariosTexto,
        menu: menuText,
        menu_imagen_url: menuImageUrl,
        metodos_pago: metodosPagoTexto,
        telefono_dueno: data.step5.ownerWhatsapp,
        contacto_humano: data.step5.ownerWhatsapp,
        numeros_notificacion: data.step5.ownerWhatsapp,
        prompt_sistema: promptSistema,
      })
      .select()
      .single();

    if (error || !insertedNegocio) {
      console.error("[onboarding] negocios insert returned no row:", {
        error,
        insertedNegocio,
        negocioId,
      });
      const rolledBack = await rollbackAuthUser(admin, authUserId);
      return {
        ok: false,
        error: rolledBack
          ? "No pudimos guardar tu negocio. Intenta de nuevo en un momento."
          : INCONSISTENT_STATE_MESSAGE,
      };
    }
  } catch (error: unknown) {
    console.error("[onboarding] negocios insert threw:", error);
    const rolledBack = await rollbackAuthUser(admin, authUserId);
    return {
      ok: false,
      error: rolledBack
        ? "No pudimos conectar con la base de datos. Intenta de nuevo."
        : INCONSISTENT_STATE_MESSAGE,
    };
  }

  // 7. Insert into usuarios_panel. On failure, rollback negocios + auth user.
  try {
    const { data: insertedUsuario, error } = await admin
      .from("usuarios_panel")
      .insert({
        email: data.step5.email,
        negocio_id: negocioId,
        rol: "owner",
        activo: true,
        auth_user_id: authUserId,
      })
      .select()
      .single();

    if (error || !insertedUsuario) {
      console.error("[onboarding] usuarios_panel insert returned no row:", {
        error,
        insertedUsuario,
        negocioId,
        authUserId,
        email: data.step5.email,
      });
      const negocioRolled = await rollbackNegocio(admin, negocioId);
      const userRolled = await rollbackAuthUser(admin, authUserId);
      const fullyRolled = negocioRolled && userRolled;
      return {
        ok: false,
        error: fullyRolled
          ? "No pudimos vincular tu usuario al negocio. Intenta de nuevo."
          : INCONSISTENT_STATE_MESSAGE,
      };
    }
  } catch (error: unknown) {
    console.error("[onboarding] usuarios_panel insert threw:", error);
    const negocioRolled = await rollbackNegocio(admin, negocioId);
    const userRolled = await rollbackAuthUser(admin, authUserId);
    const fullyRolled = negocioRolled && userRolled;
    return {
      ok: false,
      error: fullyRolled
        ? "No pudimos vincular tu usuario al negocio. Intenta de nuevo."
        : INCONSISTENT_STATE_MESSAGE,
    };
  }

  // 8. Operational log so Michael sees new registrations until a real
  // notification channel (Slack/email) is wired up.
  console.log(
    "[ONBOARDING] NUEVO NEGOCIO REGISTRADO:",
    JSON.stringify({
      negocio_id: negocioId,
      nombre: data.step1.businessName,
      tipo: data.step1.businessType,
      ciudad: data.step1.city,
      email: data.step5.email,
      telefono_dueno: data.step5.ownerWhatsapp,
      fecha: new Date().toISOString(),
    })
  );
  console.log(
    `[ONBOARDING] TODO: provisionar twilio_from para "${negocioId}" y avisar al dueño cuando esté listo.`
  );

  // 9. Sign the new user in via the cookie-aware server client so they land
  // on /onboarding/completado already authenticated.
  try {
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.step5.email,
      password: data.step5.password,
    });

    if (signInError) {
      console.error(
        "[onboarding] signIn after create failed:",
        signInError
      );
      return {
        ok: false,
        error:
          "Tu cuenta fue creada, pero no pudimos iniciar sesión automáticamente. Inicia sesión manualmente con tu email y contraseña.",
      };
    }
  } catch (error: unknown) {
    console.error("[onboarding] signIn threw:", error);
    return {
      ok: false,
      error:
        "Tu cuenta fue creada, pero no pudimos iniciar sesión automáticamente. Inicia sesión manualmente con tu email y contraseña.",
    };
  }

  return { ok: true };
}

async function rollbackAuthUser(
  admin: AdminClient,
  authUserId: string
): Promise<boolean> {
  try {
    const { error } = await admin.auth.admin.deleteUser(authUserId);
    if (error) {
      console.error("[onboarding] ROLLBACK auth.deleteUser failed:", {
        authUserId,
        error,
      });
      return false;
    }
    return true;
  } catch (error: unknown) {
    console.error("[onboarding] ROLLBACK auth.deleteUser threw:", {
      authUserId,
      error,
    });
    return false;
  }
}

async function rollbackNegocio(
  admin: AdminClient,
  negocioId: string
): Promise<boolean> {
  try {
    const { error } = await admin
      .from("negocios")
      .delete()
      .eq("negocio_id", negocioId);
    if (error) {
      console.error("[onboarding] ROLLBACK negocios delete failed:", {
        negocioId,
        error,
      });
      return false;
    }
    return true;
  } catch (error: unknown) {
    console.error("[onboarding] ROLLBACK negocios delete threw:", {
      negocioId,
      error,
    });
    return false;
  }
}
