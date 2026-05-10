"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export type AccionPedido = "camino" | "listo" | "entregado" | "cancelado";

const ACCIONES_VALIDAS: readonly AccionPedido[] = [
  "camino",
  "listo",
  "entregado",
  "cancelado",
] as const;

interface UpdatePedidoEstadoParams {
  pedidoCorto: number;
  accion: AccionPedido;
}

type UpdateResult = { ok: true } | { ok: false; error: string };

function isAccionValida(value: string): value is AccionPedido {
  return (ACCIONES_VALIDAS as readonly string[]).includes(value);
}

export async function updatePedidoEstado({
  pedidoCorto,
  accion,
}: UpdatePedidoEstadoParams): Promise<UpdateResult> {
  // Validate accion
  if (!isAccionValida(accion)) {
    return { ok: false, error: "Acción no válida." };
  }

  // Validate pedidoCorto
  if (!Number.isInteger(pedidoCorto) || pedidoCorto <= 0) {
    return { ok: false, error: "Número de pedido inválido." };
  }

  const usuario = await getCurrentUser();
  if (!usuario) return { ok: false, error: "No autenticado." };

  // TODO: cuando admin pueda gestionar múltiples negocios desde el panel,
  // agregar un parámetro negocioId opcional y un selector de negocio en la UI.
  if (!usuario.negocioId) {
    return { ok: false, error: "Admin sin negocio asignado." };
  }

  if (!process.env.BOT_WEBHOOK_URL) {
    console.error("[updatePedidoEstado] BOT_WEBHOOK_URL no está definida");
    return { ok: false, error: "Configuración del servidor incompleta." };
  }

  const supabase = await createClient();

  const { data: negocio, error: negocioError } = await supabase
    .from("negocios")
    .select("contacto_humano, twilio_from")
    .eq("negocio_id", usuario.negocioId)
    .maybeSingle();

  if (negocioError || !negocio) {
    console.error("[updatePedidoEstado] no se pudo leer el negocio", negocioError);
    return { ok: false, error: "No se pudo obtener la configuración del negocio." };
  }

  if (!negocio.contacto_humano || !negocio.twilio_from) {
    return {
      ok: false,
      error: "El negocio no tiene configurado contacto_humano o twilio_from.",
    };
  }

  // Normalize twilio_from: ensure it has the "whatsapp:" prefix once
  const cleanTo = negocio.twilio_from.startsWith("whatsapp:")
    ? negocio.twilio_from
    : `whatsapp:${negocio.twilio_from}`;

  const params = new URLSearchParams();
  params.set("Body", `${accion} ${pedidoCorto}`);
  params.set("From", `whatsapp:${negocio.contacto_humano}`);
  params.set("To", cleanTo);
  params.set("ProfileName", "Panel SafeNotify");
  params.set("WaId", negocio.contacto_humano.replace(/^\+/, ""));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(process.env.BOT_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(
        "[updatePedidoEstado] webhook respondió con error",
        { status: response.status, accion, pedidoCorto, negocioId: usuario.negocioId }
      );
      return { ok: false, error: "No se pudo enviar el comando al bot." };
    }

    return { ok: true };
  } catch (err) {
    console.error("[updatePedidoEstado] webhook inalcanzable", err);
    return { ok: false, error: "No se pudo enviar el comando al bot." };
  } finally {
    clearTimeout(timeout);
  }
}
