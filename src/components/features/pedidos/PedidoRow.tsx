"use client";

import { useTransition, useState } from "react";
import { MoreVertical } from "lucide-react";
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
import { PedidoDetalleHover } from "@/components/features/pedidos/PedidoDetalleHover";
import { formatRelativeTime, formatPhone, phoneToGradient } from "@/lib/utils";
import type { AccionPedido } from "@/lib/actions/updatePedidoEstado";
import type { PedidoEstado } from "@/types/ui.types";
import type { Tables } from "@/lib/supabase/database.types";

type Pedido = Tables<"pedidos">;

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
  pedidoCorto: number;
  estado: PedidoEstado;
  isPendingExternal: boolean;
  onAccion: (pedidoCorto: number, accion: AccionPedido) => Promise<void>;
  onDropdownOpenChange?: (open: boolean) => void;
}

function AccionesDropdown({
  pedidoCorto,
  estado,
  isPendingExternal,
  onAccion,
  onDropdownOpenChange,
}: AccionesDropdownProps) {
  const [isPending, startTransition] = useTransition();
  const disabled = isPending || isPendingExternal;

  function handleAccion(accion: AccionPedido) {
    startTransition(async () => {
      await onAccion(pedidoCorto, accion);
    });
  }

  const sinAcciones = estado === "entregado" || estado === "cancelado";

  return (
    <DropdownMenu onOpenChange={onDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex h-11 w-11 items-center justify-center rounded-md transition-all duration-200 disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.60)",
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
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
                  onClick={() => handleAccion("camino")}
                  style={{ color: "#A78BFA", cursor: "pointer" }}
                >
                  Marcar en camino
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAccion("listo")}
                  style={{ color: "#FFD166", cursor: "pointer" }}
                >
                  Marcar listo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAccion("cancelado")}
                  style={{ color: "#F4A8A6", cursor: "pointer" }}
                >
                  Cancelar
                </DropdownMenuItem>
              </>
            )}
            {(estado === "en_camino" || estado === "listo") && (
              <>
                <DropdownMenuItem
                  onClick={() => handleAccion("entregado")}
                  style={{ color: "#B8D88A", cursor: "pointer" }}
                >
                  Marcar entregado
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAccion("cancelado")}
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
  isPendingConfirmation: boolean;
  onAccion: (pedidoCorto: number, accion: AccionPedido) => Promise<void>;
}

export function PedidoRow({ pedido, isNew, isPendingConfirmation, onAccion }: PedidoRowProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
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
      <div
        className="hidden md:grid md:items-center md:gap-3"
        style={{ gridTemplateColumns: "100px minmax(160px,1fr) minmax(120px,1.5fr) 100px 140px 80px 60px" }}
      >
        {/* Info columns (cols 1-6): wrapped with hover card trigger */}
        <PedidoDetalleHover pedido={pedido}>
          <div
            className="col-span-6 grid items-center gap-3 contents"
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
          </div>
        </PedidoDetalleHover>

        {/* Acciones — outside the hover trigger */}
        <div className="flex justify-end">
          <AccionesDropdown
            pedidoCorto={pedido.pedido_corto}
            estado={estado}
            isPendingExternal={isPendingConfirmation}
            onAccion={onAccion}
          />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex flex-col gap-2 md:hidden">
        {/* Header row: info trigger + estado + acciones */}
        <div className="flex items-center gap-2">
          {/* Info zone — click opens the popover */}
          <PedidoDetalleHover
            pedido={pedido}
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
          >
            <div className="flex flex-1 items-center gap-2 min-w-0">
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
            </div>
          </PedidoDetalleHover>
          <EstadoBadge estado={estado} />
          {/* Acciones — outside the popover trigger; opening it closes the popover */}
          <AccionesDropdown
            pedidoCorto={pedido.pedido_corto}
            estado={estado}
            isPendingExternal={isPendingConfirmation}
            onAccion={onAccion}
            onDropdownOpenChange={(open) => {
              if (open) setPopoverOpen(false);
            }}
          />
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
