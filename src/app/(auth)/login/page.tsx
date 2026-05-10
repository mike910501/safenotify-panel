import { redirect } from "next/navigation";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export default async function LoginPage() {
  const usuario = await getCurrentUser();
  if (usuario) redirect("/conversaciones");

  return (
    <div
      className="w-full max-w-sm rounded-2xl px-8 py-8"
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
          SafeNotify Panel
        </h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.70)" }}>
          Inicia sesión para continuar
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
