// src/lib/motion/springs.ts
// Spring presets para framer-motion — NO modificar los números sin aprobación.
// Regla: opacity → DURATION. Transforms (x, y, scale, rotate) → SPRING.

export const SPRING = {
  // Para botones (tap, scale) — rápido y firme
  snappy: { type: "spring", stiffness: 500, damping: 30 },
  // Para transiciones de pantalla (lista → detalle, drawer)
  smooth: { type: "spring", stiffness: 400, damping: 35 },
  // Para elementos que "rebotan" un poco (toasts, badges)
  bouncy: { type: "spring", stiffness: 350, damping: 22 },
  // Para entradas suaves de listas (sin overshoot)
  gentle: { type: "spring", stiffness: 200, damping: 28 },
} as const;

// Duraciones SOLO para fades (opacity), no para transforms
export const DURATION = {
  fast: 0.15,
  medium: 0.25,
  slow: 0.4,
} as const;
