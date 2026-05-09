// UI-specific types for SafeNotify Panel.

export type ChatUrgencyLevel = "normal" | "requiere_humano" | "cliente_molesto";

export type PedidoEstado =
  | "abierto"
  | "en_preparacion"
  | "entregado"
  | "cancelado";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
