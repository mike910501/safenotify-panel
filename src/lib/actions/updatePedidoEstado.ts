"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import type { PedidoEstado } from "@/types/ui.types";
import type { Json } from "@/lib/supabase/database.types";

const ESTADOS_VALIDOS: readonly PedidoEstado[] = [
  "abierto",
  "en_preparacion",
  "entregado",
  "cancelado",
] as const;

interface UpdateParams {
  pedidoId: string;
  nuevoEstado: PedidoEstado;
}

type UpdateResult = { ok: true } | { ok: false; error: string };

interface HistorialEntry {
  fecha: string;
  de: string;
  a: string;
  por: string;
}

export async function updatePedidoEstado({
  pedidoId,
  nuevoEstado,
}: UpdateParams): Promise<UpdateResult> {
  // Validate estado value
  if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
    return { ok: false, error: "Estado no válido." };
  }

  const usuario = await getCurrentUser();
  if (!usuario) return { ok: false, error: "No autenticado." };

  const supabase = await createClient();

  // Fetch the pedido to validate permissions and read current state
  const { data: pedido, error: fetchError } = await supabase
    .from("pedidos")
    .select("id, negocio_id, estado, historial_modificaciones")
    .eq("id", pedidoId)
    .maybeSingle();

  if (fetchError || !pedido) {
    return { ok: false, error: "Pedido no encontrado." };
  }

  // Permission check: non-admin can only update pedidos from their own negocio
  if (usuario.rol !== "admin" && pedido.negocio_id !== usuario.negocioId) {
    return { ok: false, error: "Sin permiso para actualizar este pedido." };
  }

  // Build updated historial_modificaciones
  const entrada: HistorialEntry = {
    fecha: new Date().toISOString(),
    de: pedido.estado,
    a: nuevoEstado,
    por: usuario.email,
  };

  const historialPrevio: Json[] = Array.isArray(pedido.historial_modificaciones)
    ? (pedido.historial_modificaciones as Json[])
    : [];

  const nuevoHistorial: Json[] = [...historialPrevio, entrada as unknown as Json];

  const { error: updateError } = await supabase
    .from("pedidos")
    .update({
      estado: nuevoEstado,
      actualizado_en: new Date().toISOString(),
      historial_modificaciones: nuevoHistorial,
    })
    .eq("id", pedidoId);

  if (updateError) {
    return { ok: false, error: "Error al actualizar el pedido." };
  }

  revalidatePath("/pedidos");

  return { ok: true };
}
