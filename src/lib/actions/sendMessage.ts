"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { pauseBot } from "@/lib/actions/pauseBot";

interface SendMessageParams {
  phone: string;
  negocioId: string;
  contenido: string;
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function sendMessage({
  phone,
  negocioId,
  contenido,
}: SendMessageParams): Promise<ActionResult> {
  const usuario = await getCurrentUser();
  if (!usuario) return { ok: false, error: "No autenticado" };

  if (usuario.rol !== "admin" && usuario.negocioId !== negocioId) {
    return { ok: false, error: "Sin permiso" };
  }

  const trimmed = contenido.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "El mensaje no puede estar vacío" };
  }
  if (trimmed.length > 1000) {
    return { ok: false, error: "El mensaje no puede superar 1000 caracteres" };
  }

  const supabase = await createClient();

  // Insert en mensajes_salientes_panel — operación crítica.
  const { error: msgError } = await supabase
    .from("mensajes_salientes_panel")
    .insert({
      negocio_id: negocioId,
      phone_destino: phone,
      mensaje: trimmed,
      enviado_por: usuario.email,
      estado: "pendiente",
    });

  if (msgError) {
    console.error("[sendMessage] error inserting mensaje_saliente:", msgError);
    return { ok: false, error: msgError.message };
  }

  // Pausar el bot automáticamente al enviar un mensaje manual.
  // Si falla la pausa, se loggea pero no se interrumpe — el mensaje ya fue encolado.
  // TODO: agregar observabilidad (Sentry / Datadog) para fallo de pausa silencioso.
  const pausaResult = await pauseBot({ phone, negocioId, durationMinutes: 30 });
  if (!pausaResult.ok) {
    console.warn(
      "[sendMessage] mensaje encolado pero pausa falló:",
      pausaResult.error
    );
  }

  revalidatePath("/conversaciones");
  return { ok: true };
}
