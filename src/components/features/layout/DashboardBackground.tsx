/**
 * DashboardBackground
 * Fondo fijo glassmorphism con gradiente animado, grid overlay y orbs de glow.
 * Posicionado con z-index -1 para quedar detrás de todo el contenido.
 * Este componente no tiene "use client" — las animaciones son puro CSS.
 */
export function DashboardBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -1 }}
    >
      {/* Gradiente animado de fondo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, var(--bg-deep-1), var(--bg-deep-2), var(--bg-deep-3))",
          backgroundSize: "200% 200%",
          animation: "gradientShift 10s ease-in-out infinite",
        }}
      />

      {/* Grid overlay — líneas sutiles */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Orb top-right — púrpura */}
      <div
        className="absolute"
        style={{
          top: "-100px",
          right: "-100px",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.25), transparent 60%)",
          animation: "orbPulse 4.5s ease-in-out infinite",
          borderRadius: "50%",
        }}
      />

      {/* Orb bottom-left — azul */}
      <div
        className="absolute"
        style={{
          bottom: "-80px",
          left: "-80px",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.20), transparent 60%)",
          animation: "orbPulseAlt 5s ease-in-out infinite",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
