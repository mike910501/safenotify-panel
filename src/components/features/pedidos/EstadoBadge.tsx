import type { PedidoEstado } from "@/types/ui.types";

interface EstadoBadgeProps {
  estado: PedidoEstado;
}

const ESTADO_CONFIG: Record<
  PedidoEstado,
  { label: string; style: React.CSSProperties; className: string }
> = {
  abierto: {
    label: "Abierto",
    style: {
      background: "rgba(250,224,184,0.15)",
      border: "1px solid rgba(250,224,184,0.40)",
      color: "#FAE0B8",
    },
    className:
      "px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm animate-[tagPulse_3s_ease-in-out_infinite]",
  },
  en_camino: {
    label: "En camino",
    style: {
      background: "rgba(139,92,246,0.15)",
      border: "1px solid rgba(139,92,246,0.40)",
      color: "#A78BFA",
      boxShadow: "0 0 8px rgba(139,92,246,0.20)",
    },
    className: "px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm",
  },
  listo: {
    label: "Listo",
    style: {
      background: "rgba(255,209,102,0.15)",
      border: "1px solid rgba(255,209,102,0.40)",
      color: "#FFD166",
    },
    className: "px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm",
  },
  entregado: {
    label: "Entregado",
    style: {
      background: "rgba(184,216,138,0.15)",
      border: "1px solid rgba(184,216,138,0.30)",
      color: "#B8D88A",
    },
    className: "px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm",
  },
  cancelado: {
    label: "Cancelado",
    style: {
      background: "rgba(244,168,166,0.10)",
      border: "1px solid rgba(244,168,166,0.25)",
      color: "#F4A8A6",
      opacity: 0.7,
    },
    className:
      "px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm line-through",
  },
};

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const config = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.abierto;
  return (
    <span className={config.className} style={config.style}>
      {config.label}
    </span>
  );
}
