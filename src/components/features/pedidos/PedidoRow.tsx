"use client";

import { useTransition } from "react";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EstadoBadge } from "@/components/features/pedidos/EstadoBadge";
import { updatePedidoEstado } from "@/lib/actions/updatePedidoEstado";
import { formatRelativeTime, formatPhone, phoneToGradient } from "@/lib/utils";
import type { PedidoEstado } from "@/types/ui.types";
import type { Tables } from "@/lib/supabase/database.types";

type Pedido = Tables<"pedidos">;

const ESTADO_LABELS: Readonly<Record<PedidoEstado, string>> = {
  abierto: "Abierto",
  en_preparacion: "En preparación",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function formatTotal(total: number | null): string {
  if (total === null || total === undefined) return "—";
  return COP.format(total);
}

function getClienteInitials(nombre: string | null, phone: string): string {
  if (nombre && nombre.trim().length > 0) {
    const parts = nombre.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 2 ? digits.slice(-2) : "?";
}

function getClienteLabel(nombre: string | null, phone: string): string {
  if (nombre && nombre.trim().length > 0) return nombre.trim();
  return formatPhone(phone);
}

interface AccionesDropdownProps {
  pedidoId: string;
  estado: PedidoEstado;
}

function AccionesDropdown({ pedidoId, estado }: AccionesDropdownProps) {
  const [isPending, startTransition] = useTransition();

  function handleCambiarEstado(nuevoEstado: PedidoEstado) {
    startTransition(async () => {
      const result = await updatePedidoEstado({ pedidoId, nuevoEstado });
      if (result.ok) {
        toast.success(`Pedido marcado como ${ESTADO_LABELS[nuevoEstado].toLowerCase()}.`);
      } else {
        toast.error("No se pudo actualizar el pedido. Intenta de nuevo.");
      }
    });
  }

  const sinAcciones = estado === "entregado" || estado === "cancelado";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200 disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.60)",
          }}
          onMouseEnter={(e) => {
            if (!isPending) {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLButtonElement).style.color =
              "rgba(255,255,255,0.60)";
          }}
          aria-label="Acciones del pedido"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        style={{
          background: "#1A1654",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#FFFFFF",
        }}
      >
        {sinAcciones ? (
          <DropdownMenuItem disabled style={{ color: "rgba(255,255,255,0.40)" }}>
            Sin acciones
          </DropdownMenuItem>
        ) : (
          <>
            {estado === "abierto" && (
              <>
                <DropdownMenuItem
                  onClick={() => handleCambiarEstado("en_preparacion")}
                  style={{ color: "#FFD166", cursor: "pointer" }}
                >
                  Marcar en preparación
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleCambiarEstado("entregado")}
                  style={{ color: "#B8D88A", cursor: "pointer" }}
                >
                  Marcar entregado
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleCambiarEstado("cancelado")}
                  style={{ color: "#F4A8A6", cursor: "pointer" }}
                >
                  Cancelar
                </DropdownMenuItem>
              </>
            )}
            {estado === "en_preparacion" && (
              <>
                <DropdownMenuItem
                  onClick={() => handleCambiarEstado("entregado")}
                  style={{ color: "#B8D88A", cursor: "pointer" }}
                >
                  Marcar entregado
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleCambiarEstado("abierto")}
                  style={{ color: "#FAE0B8", cursor: "pointer" }}
                >
                  Volver a abierto
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleCambiarEstado("cancelado")}
                  style={{ color: "#F4A8A6", cursor: "pointer" }}
                >
                  Cancelar
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface PedidoRowProps {
  pedido: Pedido;
  isNew: boolean;
}

export function PedidoRow({ pedido, isNew }: PedidoRowProps) {
  const estado = pedido.estado as PedidoEstado;
  const avatarGradient = phoneToGradient(pedido.phone);
  const initials = getClienteInitials(pedido.nombre_cliente, pedido.phone);
  const clienteLabel = getClienteLabel(pedido.nombre_cliente, pedido.phone);
  const hora = formatRelativeTime(pedido.creado_en);
  const horaCompleta = new Date(pedido.creado_en).toLocaleString("es-CO");

  const rowStyle: React.CSSProperties = isNew
    ? {
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: "rgba(139,92,246,0.60)",
        boxShadow: "0 0 24px rgba(139,92,246,0.40)",
        animation: "messageGlow 2s ease-out forwards",
      }
    : {
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: "rgba(255,255,255,0.12)",
      };

  return (
    <div
      className="rounded-xl border px-4 py-3 mb-2 transition-all duration-200"
      style={rowStyle}
      onMouseEnter={(e) => {
        if (!isNew) {
          (e.currentTarget as HTMLDivElement).style.background =
            "rgba(255,255,255,0.10)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 8px 24px rgba(139,92,246,0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isNew) {
          (e.currentTarget as HTMLDivElement).style.background =
            "rgba(255,255,255,0.06)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }
      }}
    >
      {/* Desktop layout */}
      <div className="hidden md:grid md:items-center md:gap-3"
        style={{ gridTemplateColumns: "100px minmax(160px,1fr) minmax(120px,1.5fr) 100px 140px 80px 60px" }}
      >
        {/* Código */}
        <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>
          #{pedido.pedido_id}
        </span>

        {/* Cliente */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-medium"
            style={{ background: avatarGradient }}
          >
            {initials}
          </div>
          <span className="truncate text-sm text-white">{clienteLabel}</span>
        </div>

        {/* Items */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="line-clamp-1 text-sm cursor-default"
                style={{ color: "rgba(255,255,255,0.80)", maxWidth: "200px" }}
              >
                {pedido.items ?? "—"}
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              style={{
                background: "#1A1654",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#FFFFFF",
                maxWidth: "280px",
                whiteSpace: "pre-wrap",
              }}
            >
              {pedido.items ?? "Sin items"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Total */}
        <span className="font-medium text-white text-sm">
          {formatTotal(pedido.total)}
        </span>

        {/* Estado */}
        <EstadoBadge estado={estado} />

        {/* Hora */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="text-xs cursor-default"
                style={{ color: "rgba(255,255,255,0.60)" }}
              >
                {hora}
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              style={{
                background: "#1A1654",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#FFFFFF",
              }}
            >
              {horaCompleta}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Acciones */}
        <div className="flex justify-end">
          <AccionesDropdown pedidoId={pedido.id} estado={estado} />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex flex-col gap-2 md:hidden">
        {/* Header row: avatar + nombre + estado + acciones */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-medium"
            style={{ background: avatarGradient }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <span className="truncate text-sm font-medium text-white block">
              {clienteLabel}
            </span>
            <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
              #{pedido.pedido_id}
            </span>
          </div>
          <EstadoBadge estado={estado} />
          <AccionesDropdown pedidoId={pedido.id} estado={estado} />
        </div>

        {/* Items */}
        <p
          className="line-clamp-2 text-xs pl-10"
          style={{ color: "rgba(255,255,255,0.70)" }}
        >
          {pedido.items ?? "—"}
        </p>

        {/* Footer: total + hora */}
        <div className="flex items-center justify-between pl-10">
          <span className="font-medium text-white text-sm">{formatTotal(pedido.total)}</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
            {hora}
          </span>
        </div>
      </div>
    </div>
  );
}
