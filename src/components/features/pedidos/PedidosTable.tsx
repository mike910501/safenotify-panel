"use client";

import { useEffect, useState, useCallback } from "react";
import { ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PedidoFilters } from "@/components/features/pedidos/PedidoFilters";
import { PedidoRow } from "@/components/features/pedidos/PedidoRow";
import type { PedidoEstado } from "@/types/ui.types";
import type { Tables } from "@/lib/supabase/database.types";

type Pedido = Tables<"pedidos">;
type FiltroEstado = "todos" | PedidoEstado;

const ESTADO_LABELS: Record<PedidoEstado, string> = {
  abierto: "Abierto",
  en_preparacion: "En preparación",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

interface PedidosTableProps {
  initialPedidos: Pedido[];
  negocioId: string | null;
  rol: "admin" | "owner" | "operator";
}

export function PedidosTable({ initialPedidos, negocioId, rol }: PedidosTableProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>(initialPedidos);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [newPedidoIds, setNewPedidoIds] = useState<Set<string>>(new Set());

  const markAsNew = useCallback((id: string) => {
    setNewPedidoIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setNewPedidoIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channelFilter =
      rol !== "admin" && negocioId
        ? `negocio_id=eq.${negocioId}`
        : undefined;

    const channel = supabase
      .channel("pedidos-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pedidos",
          ...(channelFilter ? { filter: channelFilter } : {}),
        },
        (payload) => {
          const nuevo = payload.new as Pedido;
          setPedidos((prev) => [nuevo, ...prev]);
          markAsNew(nuevo.id);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pedidos",
          ...(channelFilter ? { filter: channelFilter } : {}),
        },
        (payload) => {
          const actualizado = payload.new as Pedido;
          setPedidos((prev) =>
            prev.map((p) => (p.id === actualizado.id ? actualizado : p))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "pedidos",
          ...(channelFilter ? { filter: channelFilter } : {}),
        },
        (payload) => {
          const eliminado = payload.old as { id: string };
          setPedidos((prev) => prev.filter((p) => p.id !== eliminado.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [negocioId, rol, markAsNew]);

  const pedidosFiltrados =
    filtroEstado === "todos"
      ? pedidos
      : pedidos.filter((p) => p.estado === filtroEstado);

  const conteos: Record<FiltroEstado, number> = {
    todos: pedidos.length,
    abierto: pedidos.filter((p) => p.estado === "abierto").length,
    en_preparacion: pedidos.filter((p) => p.estado === "en_preparacion").length,
    entregado: pedidos.filter((p) => p.estado === "entregado").length,
    cancelado: pedidos.filter((p) => p.estado === "cancelado").length,
  };

  return (
    <div className="flex flex-col gap-4">
      <PedidoFilters
        filtroActivo={filtroEstado}
        onChange={setFiltroEstado}
        conteos={conteos}
      />

      {/* Desktop column headers */}
      {pedidosFiltrados.length > 0 && (
        <div
          className="hidden md:grid md:items-center md:gap-3 px-4 py-2 rounded-lg"
          style={{
            gridTemplateColumns: "100px minmax(160px,1fr) minmax(120px,1.5fr) 100px 140px 80px 60px",
            color: "rgba(255,255,255,0.40)",
          }}
        >
          <span className="text-xs font-medium uppercase tracking-wide">Código</span>
          <span className="text-xs font-medium uppercase tracking-wide">Cliente</span>
          <span className="text-xs font-medium uppercase tracking-wide">Items</span>
          <span className="text-xs font-medium uppercase tracking-wide">Total</span>
          <span className="text-xs font-medium uppercase tracking-wide">Estado</span>
          <span className="text-xs font-medium uppercase tracking-wide">Hora</span>
          <span className="sr-only">Acciones</span>
        </div>
      )}

      {/* Empty state — sin pedidos en absoluto */}
      {pedidos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <ShoppingCart
            className="h-16 w-16"
            style={{
              color: "rgba(255,255,255,0.30)",
              filter: "drop-shadow(0 0 24px rgba(139,92,246,0.40))",
              animation: "iconPulse 3s ease-in-out infinite",
            }}
          />
          <div className="text-center">
            <p className="text-white font-medium">Aún no hay pedidos.</p>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.50)" }}>
              Cuando tus clientes hagan pedidos por el bot, aparecerán aquí.
            </p>
          </div>
        </div>
      )}

      {/* Empty state — filtro activo sin resultados */}
      {pedidos.length > 0 && pedidosFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-white/60 text-sm">
            No hay pedidos en estado{" "}
            <span className="text-white font-medium">
              {filtroEstado !== "todos" ? ESTADO_LABELS[filtroEstado as PedidoEstado] : filtroEstado}
            </span>
            .
          </p>
          <button
            type="button"
            onClick={() => setFiltroEstado("todos")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.70)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.10)";
              (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(255,255,255,0.70)";
            }}
          >
            Ver todos
          </button>
        </div>
      )}

      {/* Rows */}
      <div>
        {pedidosFiltrados.map((pedido) => (
          <PedidoRow
            key={pedido.id}
            pedido={pedido}
            isNew={newPedidoIds.has(pedido.id)}
          />
        ))}
      </div>
    </div>
  );
}
