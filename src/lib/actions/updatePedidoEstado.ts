"use server";

import type { PedidoEstado } from "@/types/ui.types";

// TODO: implementar en feat/pedidos
// update estado en pedidos (solo campo estado y opcionalmente notas)
// NO tocar items, total, pedido_id, pedido_corto

export async function updatePedidoEstado(
  _pedidoId: string,
  _nuevoEstado: PedidoEstado,
  _negocioId: string
): Promise<{ error: string | null }> {
  return { error: "No implementado aún" };
}
