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

interface WebhookResponse {
  ok: boolean;
  twilio_sid?: string;
  mensaje_id?: string;
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

  if (!process.env.N8N_WEBHOOK_URL || !process.env.N8N_WEBHOOK_SECRET) {
    console.error("[sendMessage] env vars N8N_WEBHOOK_URL o N8N_WEBHOOK_SECRET no definidas");
    return { ok: false, error: "Configuración del servidor incompleta" };
  }

  const supabase = await createClient();

  const { data: mensajeInsertado, error: msgError } = await supabase
    .from("mensajes_salientes_panel")
    .insert({
      negocio_id: negocioId,
      phone_destino: phone,
      mensaje: trimmed,
      enviado_por: usuario.email,
      estado: "pendiente",
    })
    .select("id")
    .single();

  if (msgError) {
    console.error("[sendMessage] error inserting mensaje_saliente:", msgError);
    return { ok: false, error: msgError.message };
  }

  const mensajeId = mensajeInsertado.id as string;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  let webhookOk = false;

  try {
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Panel-Secret": process.env.N8N_WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        mensaje_id: mensajeId,
        negocio_id: negocioId,
        phone_destino: phone,
        mensaje: trimmed,
        enviado_por: usuario.email,
      }),
      signal: controller.signal,
    });

    const data = await response.json() as WebhookResponse;

    if (response.ok && data.ok) {
      // Caso A: webhook exitoso — n8n ya actualizó la fila e insertó en historial.
      webhookOk = true;
    } else {
      // Caso B: webhook respondió pero con error — n8n ya marcó la fila como error.
      console.error("[sendMessage] webhook error", { status: response.status, body: data });
      return { ok: false, error: "No se pudo enviar el mensaje" };
    }
  } catch (err) {
    // Caso C: fetch lanzó excepción (timeout, red caída, n8n inalcanzable).
    // La fila quedó en 'pendiente'; marcarla manualmente como error.
    console.error("[sendMessage] webhook unreachable", err);
    await supabase
      .from("mensajes_salientes_panel")
      .update({ estado: "error", error_mensaje: "webhook_unreachable" })
      .eq("id", mensajeId);
    return { ok: false, error: "No se pudo enviar el mensaje" };
  } finally {
    clearTimeout(timeout);
  }

  if (webhookOk) {
    // Al enviar un mensaje manual, pausamos el bot indefinidamente para que Claudia
    // tenga control completo del chat. Debe devolver el control manualmente cuando termine.
    // Si falla la pausa, se loggea pero no se interrumpe — el mensaje ya fue enviado.
    const pausaResult = await pauseBot({ phone, negocioId });
    if (!pausaResult.ok) {
      console.warn(
        "[sendMessage] mensaje enviado pero pausa falló:",
        pausaResult.error
      );
    }
  }

  revalidatePath("/conversaciones");
  return { ok: true };
}
