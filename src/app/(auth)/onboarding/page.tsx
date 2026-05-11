import Link from "next/link";
import { OnboardingWizard } from "@/components/features/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div
      className="w-full max-w-md rounded-2xl px-6 py-6 sm:px-8 sm:py-8 max-h-[calc(100dvh-2rem)] overflow-y-auto"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 0 40px rgba(139,92,246,0.20)",
      }}
    >
      <div className="mb-6 text-center">
        <h1
          className="text-xl font-semibold"
          style={{
            background: "linear-gradient(to right, #FFFFFF, #A5B4FC, #FFFFFF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Registra tu negocio
        </h1>
        <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.70)" }}>
          En unos minutos tu bot de WhatsApp queda listo para recibir pedidos.
        </p>
      </div>

      <OnboardingWizard />

      <p
        className="mt-6 text-center text-sm"
        style={{ color: "rgba(255,255,255,0.50)" }}
      >
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="hover:text-white transition-colors duration-150"
          style={{ color: "#A5B4FC" }}
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
