import type { PedidoEstado } from "@/types/ui.types";

export const PEDIDO_STATES: PedidoEstado[] = [
  "abierto",
  "en_camino",
  "listo",
  "entregado",
  "cancelado",
];

export const PEDIDO_STATE_LABELS: Record<PedidoEstado, string> = {
  abierto: "Abierto",
  en_camino: "En camino",
  listo: "Listo",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const PAUSE_DURATIONS = {
  THIRTY_MINUTES: 30,
  ONE_HOUR: 60,
  TWO_HOURS: 120,
} as const;

// Colores semánticos — referencian las CSS variables del tema
export const SEMANTIC_COLORS = {
  sidebarBg: "var(--sn-sidebar-bg)",
  sidebarTextActive: "var(--sn-sidebar-text-active)",
  accentGreen: "var(--sn-accent-green)",
  accentGreenHover: "var(--sn-accent-green-hover)",
  accentOrange: "var(--sn-accent-orange)",
  accentRed: "var(--sn-accent-red)",
  bg: "var(--sn-bg)",
  cardBg: "var(--sn-card-bg)",
} as const;
