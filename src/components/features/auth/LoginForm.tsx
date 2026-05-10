"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/actions/auth/signIn";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const result = await signIn(values);
    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: "rgba(244,168,166,0.12)",
            border: "1px solid rgba(244,168,166,0.35)",
            color: "#F4A8A6",
          }}
        >
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.80)" }}
        >
          Correo electrónico
        </Label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          {...register("email")}
          aria-invalid={!!errors.email}
          className="glass-input h-9 w-full rounded-xl px-3 text-sm transition-all duration-200 ease-out"
        />
        {errors.email && (
          <p className="text-xs" style={{ color: "#F4A8A6" }}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.80)" }}
        >
          Contraseña
        </Label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register("password")}
          aria-invalid={!!errors.password}
          className="glass-input h-9 w-full rounded-xl px-3 text-sm transition-all duration-200 ease-out"
        />
        {errors.password && (
          <p className="text-xs" style={{ color: "#F4A8A6" }}>
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 ease-out hover:-translate-y-[1px] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
        style={{
          background: "linear-gradient(to right, var(--glow-primary), var(--glow-secondary))",
          boxShadow: "0 0 24px rgba(139,92,246,0.40)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 0 32px rgba(139,92,246,0.60)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 0 24px rgba(139,92,246,0.40)";
        }}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Iniciar sesión
      </button>

      <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.50)" }}>
        <Link
          href="/recuperar-acceso"
          className="hover:text-white transition-colors duration-150"
          style={{ color: "rgba(255,255,255,0.50)" }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </form>
  );
}
