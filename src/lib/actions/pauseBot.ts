"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

const PAUSADO_HASTA_INDEFINIDO = "2099-12-31T23:59:59.000Z";

interface PauseBotParams {
  phone: string;
  negocioId: string;
}

interface UnpauseBotParams {
  phone: string;
  negocioId: string;
}

export async function pauseBot({
  phone,
  negocioId,
}: PauseBotParams): Promise<{ ok: true } | { ok: false; error: string }> {
  const usuario = await getCurrentUser();
  if (!usuario) return { ok: false, error: "No autenticado" };

  if (usuario.rol !== "admin" && usuario.negocioId !== negocioId) {
    return { ok: false, error: "Sin permiso" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("sesiones_pausadas").upsert(
    {
      negocio_id: negocioId,
      phone,
      pausado_hasta: PAUSADO_HASTA_INDEFINIDO,
      pausado_por: usuario.email,
      motivo: "control_humano",
    },
    { onConflict: "negocio_id,phone" },
  );

  if (error) {
    console.error("[pauseBot] error upserting sesion_pausada:", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/conversaciones");
  return { ok: true };
}

export async function unpauseBot({
  phone,
  negocioId,
}: UnpauseBotParams): Promise<{ ok: true } | { ok: false; error: string }> {
  const usuario = await getCurrentUser();
  if (!usuario) return { ok: false, error: "No autenticado" };

  if (usuario.rol !== "admin" && usuario.negocioId !== negocioId) {
    return { ok: false, error: "Sin permiso" };
  }

  const supabase = await createClient();
  // Restamos 1 hora para garantizar que pausado_hasta está claramente
  // en el pasado y la vista chats_activos no tiene ambigüedad de tipo
  // "pausado_hasta > now() en el momento exacto del refetch".
  const enElPasado = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Upsert con pausado_hasta en el pasado para "despausar". El UNIQUE
  // constraint sobre (negocio_id, phone) garantiza una sola fila por chat.
  // La vista chats_activos considera bot_pausado = true cuando
  // pausado_hasta > NOW(); al fijar un valor en el pasado, queda
  // neutralizado de inmediato sin riesgo de race con el refetch.
  const { error } = await supabase.from("sesiones_pausadas").upsert(
    {
      negocio_id: negocioId,
      phone,
      pausado_hasta: enElPasado,
      pausado_por: usuario.email,
      motivo: "Control devuelto al bot",
    },
    { onConflict: "negocio_id,phone" },
  );

  if (error) {
    console.error("[unpauseBot] error upserting despause:", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/conversaciones");
  return { ok: true };
}
