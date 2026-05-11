import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function OnboardingCompletadoPage() {
  return (
    <div
      className="w-full max-w-md rounded-2xl px-8 py-8"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 0 40px rgba(139,92,246,0.20)",
      }}
    >
      <div className="mb-6 flex flex-col items-center text-center">
        <div
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: "rgba(184,216,138,0.15)",
            border: "1px solid rgba(184,216,138,0.40)",
          }}
        >
          <CheckCircle2 className="h-6 w-6" style={{ color: "#B8D88A" }} />
        </div>
        <h1
          className="text-xl font-semibold"
          style={{
            background: "linear-gradient(to right, #FFFFFF, #A5B4FC, #FFFFFF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Tu cuenta está lista
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ color: "rgba(255,255,255,0.70)" }}
        >
          Ya puedes entrar al panel y conocer tu nueva herramienta.
        </p>
      </div>

      <div
        className="rounded-xl px-4 py-4 text-sm"
        style={{
          background: "rgba(250,224,184,0.08)",
          border: "1px solid rgba(250,224,184,0.25)",
          color: "rgba(255,255,255,0.80)",
        }}
      >
        <p className="font-medium" style={{ color: "#FAE0B8" }}>
          Estamos activando tu bot de WhatsApp.
        </p>
        <p className="mt-1.5" style={{ color: "rgba(255,255,255,0.65)" }}>
          En menos de 24 horas tu número quedará conectado. Te avisaremos por
          WhatsApp cuando esté listo. Mientras tanto puedes recorrer el panel.
        </p>
      </div>

      <Link
        href="/conversaciones"
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 ease-out hover:-translate-y-[1px] active:scale-[0.97]"
        style={{
          background:
            "linear-gradient(to right, var(--glow-primary), var(--glow-secondary))",
          boxShadow: "0 0 24px rgba(139,92,246,0.40)",
        }}
      >
        Ir al panel
      </Link>
    </div>
  );
}
