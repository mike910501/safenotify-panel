import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Colombian phone number for display.
 * Input: "573001234567" -> Output: "+57 300 123 4567"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("57") && digits.length === 12) {
    const local = digits.slice(2);
    return `+57 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return phone;
}

/**
 * Parses a pedido code and returns its numeric part.
 * Input: "PED-042" -> Output: 42
 */
export function parsePedidoCode(pedidoId: string): number {
  const match = pedidoId.match(/PED-(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Returns a human-readable relative time string in Spanish.
 */
export function relativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHour < 24) return `hace ${diffHour} h`;
  if (diffDay < 7) return `hace ${diffDay} d`;
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}
