"use server";

// Fase B (2026-05-12): el wizard NO crea cuentas directamente. Solo captura
// el payload como un lead pendiente de activación por admin. Ver flujo
// completo en `src/components/features/onboarding/README.md`.
//
// El código previo (auth.user + negocios + usuarios_panel + signIn) está
// preservado en `submitOnboarding.legacy.ts` por si hay que revertir.

import { createAdminClient, type AdminClient } from "@/lib/supabase/admin";
import {
  onboardingPayloadSchema,
  type OnboardingPayload,
} from "@/lib/onboarding/schemas";

export type SubmitOnboardingResult =
  | { ok: true; leadId: string }
  | { ok: false; error: string };

export async function submitOnboarding(
  input: unknown
): Promise<SubmitOnboardingResult> {
  // 1. Re-validar el payload entero server-side. Nunca confiamos en el client.
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

  // 2. Init admin client (service-role). Falla ruidosamente si no hay env.
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

  // 3. Construir el payload_wizard que va al jsonb. Excluye credenciales:
  //    password y confirmPassword NO se persisten (ver "Decisión de seguridad"
  //    en el reporte de Fase B). Cuando admin convierta el lead a cuenta real,
  //    generará una contraseña nueva o enviará un magic link.
  const payloadWizard = {
    step1: data.step1,
    step2: data.step2,
    step3: data.step3,
    step4: data.step4,
    step5: {
      email: data.step5.email,
      ownerWhatsapp: data.step5.ownerWhatsapp,
    },
  };

  // 4. INSERT en leads. `.select().single()` para detectar silent failures
  //    (mismo patrón defensivo que en submitOnboarding.legacy.ts).
  try {
    const { data: insertedLead, error } = await admin
      .from("leads")
      .insert({
        nombre_negocio: data.step1.businessName,
        tipo_negocio: data.step1.businessType,
        // El wizard NO recoge un contact-name separado; usamos businessName
        // como fallback. Admin puede editarlo al contactar el lead.
        contacto_nombre: data.step1.businessName,
        contacto_email: data.step5.email,
        contacto_telefono: data.step5.ownerWhatsapp,
        ciudad: data.step1.city,
        payload_wizard: payloadWizard,
      })
      .select()
      .single();

    if (error || !insertedLead) {
      console.error("[onboarding] leads insert returned no row:", {
        error,
        insertedLead,
        email: data.step5.email,
      });
      return {
        ok: false,
        error: "No pudimos guardar tu solicitud. Intenta de nuevo en un momento.",
      };
    }

    console.log(
      "[ONBOARDING] NUEVO LEAD CAPTURADO:",
      JSON.stringify({
        lead_id: insertedLead.id,
        nombre_negocio: data.step1.businessName,
        tipo: data.step1.businessType,
        ciudad: data.step1.city,
        email: data.step5.email,
        telefono: data.step5.ownerWhatsapp,
        fecha: new Date().toISOString(),
      })
    );
    console.log(
      `[ONBOARDING] TODO: revisar lead "${insertedLead.id}" en /admin/leads y activar cuenta cuando aplique.`
    );

    return { ok: true, leadId: insertedLead.id };
  } catch (error: unknown) {
    console.error("[onboarding] leads insert threw:", error);
    return {
      ok: false,
      error: "No pudimos conectar. Intenta de nuevo en un momento.",
    };
  }
}
