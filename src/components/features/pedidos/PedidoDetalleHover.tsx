"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EstadoBadge } from "@/components/features/pedidos/EstadoBadge";
import { formatPhone, formatRelativeTime, phoneToGradient } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/database.types";
import type { Json } from "@/lib/supabase/database.types";
import type { PedidoEstado } from "@/types/ui.types";

type Pedido = Tables<"pedidos">;

interface HistorialEntry {
  fecha: string;
  de: string;
  a: string;
  por: string;
}

function isHistorialEntry(value: unknown): value is HistorialEntry {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.fecha === "string" &&
    typeof obj.de === "string" &&
    typeof obj.a === "string" &&
    typeof obj.por === "string"
  );
}

function parseHistorial(raw: Json | null): HistorialEntry[] {
  if (!raw || !Array.isArray(raw)) return [];
  return (raw as unknown[]).filter(isHistorialEntry);
}

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function formatTotal(total: number | null): string {
  if (total === null || total === undefined) return "—";
  return COP.format(total);
}

const ESTADO_LABELS: Record<PedidoEstado, string> = {
  abierto: "Abierto",
  en_camino: "En camino",
  listo: "Listo",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

function getEstadoLabel(estado: string): string {
  return ESTADO_LABELS[estado as PedidoEstado] ?? estado;
}

function parseItems(items: string | null): string[] {
  if (!items || items.trim().length === 0) return [];
  return items.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
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

interface DetalleContentProps {
  pedido: Pedido;
  nombreNegocio?: string;
}

function DetalleContent({ pedido, nombreNegocio }: DetalleContentProps) {
  const estado = pedido.estado as PedidoEstado;
  const items = parseItems(pedido.items);
  const historial = parseHistorial(pedido.historial_modificaciones);
  const avatarGradient = phoneToGradient(pedido.phone);
  const initials = getClienteInitials(pedido.nombre_cliente, pedido.phone);
  const tiempoRelativo = formatRelativeTime(pedido.creado_en);

  async function handleCopiar() {
    const itemsText =
      items.length > 0
        ? items.map((i) => `- ${i}`).join("\n")
        : "- —";

    const negocioLabel = nombreNegocio ?? "SafeNotify";

    const texto = [
      `Pedido #${pedido.pedido_corto} - ${negocioLabel}`,
      "",
      `Cliente: ${pedido.nombre_cliente ?? "Sin nombre"}`,
      `Phone: ${formatPhone(pedido.phone)}`,
      "",
      "Items:",
      itemsText,
      "",
      `Total: ${formatTotal(pedido.total)}`,
      `Pago: ${pedido.metodo_pago ?? "-"}`,
      `Modalidad: ${pedido.direccion_entrega ?? "-"}`,
      `Notas: ${pedido.notas ?? "-"}`,
    ].join("\n");

    if (!navigator.clipboard) {
      toast.error("No se puede acceder al portapapeles en este entorno.");
      return;
    }

    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Información copiada al portapapeles");
    } catch {
      toast.error("No se pudo copiar la información.");
    }
  }

  return (
    <div className="p-4 max-w-[360px] max-h-[480px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold text-white text-sm">
            Pedido #{pedido.pedido_corto}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.50)" }}>
            {tiempoRelativo}
          </p>
        </div>
        <EstadoBadge estado={estado} />
      </div>

      {/* Separador */}
      <div
        className="mb-3 h-px w-full"
        style={{ background: "rgba(255,255,255,0.10)" }}
      />

      {/* Cliente */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-medium"
          style={{ background: avatarGradient }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {pedido.nombre_cliente ?? "Sin nombre"}
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
            {formatPhone(pedido.phone)}
          </p>
        </div>
      </div>

      {/* Separador */}
      <div
        className="mb-3 h-px w-full"
        style={{ background: "rgba(255,255,255,0.10)" }}
      />

      {/* Items */}
      <div className="mb-3">
        <p className="text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.50)" }}>
          Items
        </p>
        {items.length > 0 ? (
          <ul className="space-y-0.5">
            {items.map((item, i) => (
              <li key={i} className="text-sm text-white flex gap-1.5">
                <span style={{ color: "rgba(255,255,255,0.40)" }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>—</p>
        )}
      </div>

      {/* Total */}
      <p className="text-lg font-semibold text-white mb-2">
        {formatTotal(pedido.total)}
      </p>

      {/* Detalles adicionales */}
      <div className="space-y-1 mb-3">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>
          <span style={{ color: "rgba(255,255,255,0.40)" }}>Pago: </span>
          {pedido.metodo_pago ?? "—"}
        </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>
          <span style={{ color: "rgba(255,255,255,0.40)" }}>Modalidad: </span>
          {pedido.direccion_entrega ?? "—"}
        </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>
          <span style={{ color: "rgba(255,255,255,0.40)" }}>Notas: </span>
          {pedido.notas ?? "Sin notas"}
        </p>
      </div>

      {/* Historial de modificaciones */}
      {historial.length > 0 && (
        <>
          <div
            className="mb-2 h-px w-full"
            style={{ background: "rgba(255,255,255,0.10)" }}
          />
          <p className="text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.50)" }}>
            Historial
          </p>
          <ul className="space-y-1">
            {historial.map((entry, i) => {
              const fecha = new Date(entry.fecha).toLocaleString("es-CO", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <li key={i} className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {fecha} → de{" "}
                  <span className="text-white">{getEstadoLabel(entry.de)}</span>{" "}
                  a{" "}
                  <span className="text-white">{getEstadoLabel(entry.a)}</span>
                  {entry.por ? (
                    <>
                      {" · "}
                      <span style={{ color: "rgba(255,255,255,0.40)" }}>
                        {entry.por}
                      </span>
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* Botón copiar */}
      <button
        type="button"
        onClick={handleCopiar}
        className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
          color: "rgba(255,255,255,0.70)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.14)";
          (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLButtonElement).style.color =
            "rgba(255,255,255,0.70)";
        }}
      >
        <Copy className="h-3 w-3" />
        Copiar información
      </button>
    </div>
  );
}

const CONTENT_CLASS =
  "bg-[var(--glass-bg)] backdrop-blur-[20px] border-[var(--glass-border)] text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-0 rounded-xl";

// Estimated dimensions used before the popover ref is measured.
const ESTIMATED_W = 360;
const ESTIMATED_H = 420;
const OFFSET = 12;
const EDGE_PAD = 16;

interface PopoverSize {
  w: number;
  h: number;
}

interface CursorPos {
  x: number;
  y: number;
}

function clampToViewport(
  pos: CursorPos,
  size: PopoverSize
): { top: number; left: number } {
  if (typeof window === "undefined") {
    return { top: pos.y, left: pos.x };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = pos.x + OFFSET;
  let top = pos.y + OFFSET;

  if (left + size.w > vw - EDGE_PAD) {
    left = pos.x - size.w - OFFSET;
  }
  if (top + size.h > vh - EDGE_PAD) {
    top = pos.y - size.h - OFFSET;
  }

  // Final clamp to keep popover inside viewport
  left = Math.max(EDGE_PAD, Math.min(left, vw - size.w - EDGE_PAD));
  top = Math.max(EDGE_PAD, Math.min(top, vh - size.h - EDGE_PAD));

  return { top, left };
}

function useHoverCapability(): boolean {
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return canHover;
}

// ---------------------------------------------------------------------------
// Desktop: static popover — appears at cursor position on mouse-enter, stays put.
// ---------------------------------------------------------------------------

interface StaticPopoverProps {
  pedido: Pedido;
  nombreNegocio?: string;
  children: React.ReactNode;
}

function StaticPopover({ pedido, nombreNegocio, children }: StaticPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  // visible drives the fade-in: false = opacity-0/scale-95, true = opacity-100/scale-100
  const [isVisible, setIsVisible] = useState(false);
  const [pos, setPos] = useState<CursorPos>({ x: 0, y: 0 });
  const [size, setSize] = useState<PopoverSize>({ w: ESTIMATED_W, h: ESTIMATED_H });
  // mounted guards createPortal against SSR — document is not available server-side.
  const [mounted, setMounted] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Measure the popover after it mounts so clampToViewport uses real dimensions.
  useEffect(() => {
    if (!isOpen) return;

    const id = requestAnimationFrame(() => {
      rafId.current = null;
      if (popoverRef.current) {
        const rect = popoverRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setSize({ w: rect.width, h: rect.height });
        }
      }
      // Reveal only after first paint to avoid flicker at wrong position.
      setIsVisible(true);
    });
    rafId.current = id;

    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  const handleRowEnter = useCallback((e: React.MouseEvent) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setPos({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
    setIsVisible(false); // reset so rAF re-triggers fade-in
  }, []);

  const handleRowLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsVisible(false);
    }, 120);
  }, []);

  const handlePopoverEnter = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const handlePopoverLeave = useCallback(() => {
    setIsOpen(false);
    setIsVisible(false);
  }, []);

  const finalPos = useMemo(() => clampToViewport(pos, size), [pos, size]);

  return (
    <>
      <div
        onMouseEnter={handleRowEnter}
        onMouseLeave={handleRowLeave}
        className="contents"
      >
        {children}
      </div>

      {mounted && isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className={CONTENT_CLASS}
            onMouseEnter={handlePopoverEnter}
            onMouseLeave={handlePopoverLeave}
            style={{
              position: "fixed",
              top: finalPos.top,
              left: finalPos.left,
              zIndex: 50,
              pointerEvents: "auto",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "scale(1)" : "scale(0.95)",
              transition: "opacity 100ms ease, transform 100ms ease",
              transformOrigin: "top left",
            }}
          >
            <DetalleContent pedido={pedido} nombreNegocio={nombreNegocio} />
          </div>,
          document.body
        )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Mobile: shadcn Popover (click-controlled) — unchanged
// ---------------------------------------------------------------------------

interface ClickPopoverProps {
  pedido: Pedido;
  nombreNegocio?: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ClickPopover({ pedido, nombreNegocio, children, open, onOpenChange }: ClickPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Ver detalle del pedido"
          className="contents"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={10}
        avoidCollisions={true}
        collisionPadding={16}
        className={CONTENT_CLASS}
      >
        <DetalleContent pedido={pedido} nombreNegocio={nombreNegocio} />
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

interface PedidoDetalleHoverProps {
  pedido: Pedido;
  children: React.ReactNode;
  nombreNegocio?: string;
  // Mobile only: controlled open state for closing when the actions dropdown opens
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PedidoDetalleHover({
  pedido,
  children,
  nombreNegocio,
  open,
  onOpenChange,
}: PedidoDetalleHoverProps) {
  const canHover = useHoverCapability();

  if (canHover) {
    return (
      <StaticPopover pedido={pedido} nombreNegocio={nombreNegocio}>
        {children}
      </StaticPopover>
    );
  }

  return (
    <ClickPopover
      pedido={pedido}
      nombreNegocio={nombreNegocio}
      open={open}
      onOpenChange={onOpenChange}
    >
      {children}
    </ClickPopover>
  );
}
