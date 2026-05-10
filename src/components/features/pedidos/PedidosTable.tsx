"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PedidoFilters } from "@/components/features/pedidos/PedidoFilters";
import type { FiltroEstado } from "@/components/features/pedidos/PedidoFilters";
import { PedidoRow } from "@/components/features/pedidos/PedidoRow";
import { updatePedidoEstado } from "@/lib/actions/updatePedidoEstado";
import type { AccionPedido } from "@/lib/actions/updatePedidoEstado";
import type { PedidoEstado } from "@/types/ui.types";
import type { Tables } from "@/lib/supabase/database.types";

type Pedido = Tables<"pedidos">;

/** Maps an accion command to the expected new estado. */
const ACCION_TO_ESTADO: Record<AccionPedido, PedidoEstado> = {
  camino: "en_camino",
  listo: "listo",
  entregado: "entregado",
  cancelado: "cancelado",
};

const ESTADO_LABELS: Record<PedidoEstado, string> = {
  abierto: "Abierto",
  en_camino: "En camino",
  listo: "Listo",
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

  // Set of pedido IDs that have been optimistically updated and are waiting for bot confirmation
  const [pendingConfirmationIds, setPendingConfirmationIds] = useState<Set<string>>(new Set());

  // Map of pedidoId -> original estado, so we can revert on error
  const originalEstados = useRef<Map<string, PedidoEstado>>(new Map());

  // Map of pedidoId -> timeout handle for the 10s warning
  const confirmationTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

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

  const clearPendingConfirmation = useCallback((pedidoId: string) => {
    setPendingConfirmationIds((prev) => {
      const next = new Set(prev);
      next.delete(pedidoId);
      return next;
    });
    const handle = confirmationTimeouts.current.get(pedidoId);
    if (handle !== undefined) {
      clearTimeout(handle);
      confirmationTimeouts.current.delete(pedidoId);
    }
    originalEstados.current.delete(pedidoId);
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
          // Bot confirmed — clear the pending state and reflect the real value
          clearPendingConfirmation(actualizado.id);
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
  }, [negocioId, rol, markAsNew, clearPendingConfirmation]);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    const timeouts = confirmationTimeouts.current;
    return () => {
      timeouts.forEach((handle) => clearTimeout(handle));
    };
  }, []);

  const handleAccion = useCallback(
    async (pedidoCorto: number, accion: AccionPedido) => {
      // Find the pedido by pedido_corto
      const pedido = pedidos.find((p) => p.pedido_corto === pedidoCorto);
      if (!pedido) return;

      const estadoEsperado = ACCION_TO_ESTADO[accion];

      // Save original estado for potential revert
      originalEstados.current.set(pedido.id, pedido.estado as PedidoEstado);

      // Optimistic update
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedido.id ? { ...p, estado: estadoEsperado } : p
        )
      );

      // Mark as pending confirmation
      setPendingConfirmationIds((prev) => new Set(prev).add(pedido.id));

      // Schedule 10s warning if bot hasn't confirmed yet
      const warningHandle = setTimeout(() => {
        setPendingConfirmationIds((prev) => {
          const next = new Set(prev);
          next.delete(pedido.id);
          return next;
        });
        confirmationTimeouts.current.delete(pedido.id);
        originalEstados.current.delete(pedido.id);
        toast.warning(
          "El bot está tardando en confirmar. Verifica el estado del pedido."
        );
      }, 10_000);

      confirmationTimeouts.current.set(pedido.id, warningHandle);

      // Call the server action
      const result = await updatePedidoEstado({ pedidoCorto, accion });

      if (!result.ok) {
        // Revert optimistic update
        const estadoOriginal = originalEstados.current.get(pedido.id);
        if (estadoOriginal !== undefined) {
          setPedidos((prev) =>
            prev.map((p) =>
              p.id === pedido.id ? { ...p, estado: estadoOriginal } : p
            )
          );
        }
        clearPendingConfirmation(pedido.id);
        toast.error("No se pudo enviar el comando al bot. Intenta de nuevo.");
        return;
      }

      // Success — show feedback immediately (bot will confirm via Realtime)
      toast.success("Comando enviado al bot. El cliente recibirá la notificación en segundos.");
    },
    [pedidos, clearPendingConfirmation]
  );

  const pedidosFiltrados =
    filtroEstado === "todos"
      ? pedidos
      : pedidos.filter((p) => p.estado === filtroEstado);

  const conteos: Record<FiltroEstado, number> = {
    todos: pedidos.length,
    abierto: pedidos.filter((p) => p.estado === "abierto").length,
    en_camino: pedidos.filter((p) => p.estado === "en_camino").length,
    listo: pedidos.filter((p) => p.estado === "listo").length,
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
              {filtroEstado !== "todos"
                ? ESTADO_LABELS[filtroEstado as PedidoEstado]
                : filtroEstado}
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
            isPendingConfirmation={pendingConfirmationIds.has(pedido.id)}
            onAccion={handleAccion}
          />
        ))}
      </div>
    </div>
  );
}
