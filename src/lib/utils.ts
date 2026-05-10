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

/**
 * Alias for relativeTime — preferred name in conversations UI.
 */
export function formatRelativeTime(date: Date | string): string {
  const iso = typeof date === "string" ? date : date.toISOString();
  return relativeTime(iso);
}

/**
 * Returns initials from a name (up to 2 chars).
 * "Mario Velasco" -> "MV", null or "" -> "?"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name || name.trim().length === 0) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Derives a unique purple-blue gradient CSS string from a phone number.
 * Used for conversation list avatars in the glassmorphism UI.
 * Hue range 200-300 covers the purple-blue spectrum.
 */
export function phoneToGradient(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  let hash = 0;
  for (let i = 0; i < digits.length; i++) {
    hash = (hash * 31 + digits.charCodeAt(i)) & 0xffff;
  }
  const hue1 = (hash % 60) + 240; // 240-300: azul-púrpura
  const hue2 = (hash % 60) + 200; // 200-260: azul-índigo
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 70%, 60%))`;
}
