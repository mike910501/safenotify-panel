"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

interface PauseBotParams {
  phone: string;
  negocioId: string;
  durationMinutes?: number;
}

interface UnpauseBotParams {
  phone: string;
  negocioId: string;
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function pauseBot({
  phone,
  negocioId,
  durationMinutes = 30,
}: PauseBotParams): Promise<ActionResult> {
  const usuario = await getCurrentUser();
  if (!usuario) return { ok: false, error: "No autenticado" };

  if (usuario.rol !== "admin" && usuario.negocioId !== negocioId) {
    return { ok: false, error: "Sin permiso" };
  }

  const supabase = await createClient();
  const pausadoHasta = new Date(Date.now() + durationMinutes * 60_000).toISOString();

  const { error } = await supabase.from("sesiones_pausadas").insert({
    negocio_id: negocioId,
    phone,
    pausado_hasta: pausadoHasta,
    pausado_por: usuario.email,
    motivo: "Pausado manualmente desde el panel",
  });

  if (error) {
    console.error("[pauseBot] error inserting sesion_pausada:", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/conversaciones");
  return { ok: true };
}

export async function unpauseBot({
  phone,
  negocioId,
}: UnpauseBotParams): Promise<ActionResult> {
  const usuario = await getCurrentUser();
  if (!usuario) return { ok: false, error: "No autenticado" };

  if (usuario.rol !== "admin" && usuario.negocioId !== negocioId) {
    return { ok: false, error: "Sin permiso" };
  }

  const supabase = await createClient();
  const ahora = new Date().toISOString();

  // Insertar una nueva fila con pausado_hasta en el pasado para "despausar".
  // La vista chats_activos considera bot_pausado = true cuando existe una fila
  // con pausado_hasta > NOW(). Al insertar con pausado_hasta = ahora, se neutraliza.
  const { error } = await supabase.from("sesiones_pausadas").insert({
    negocio_id: negocioId,
    phone,
    pausado_hasta: ahora,
    pausado_por: usuario.email,
    motivo: "Despausado manualmente desde el panel",
  });

  if (error) {
    console.error("[unpauseBot] error inserting despause:", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/conversaciones");
  return { ok: true };
}
