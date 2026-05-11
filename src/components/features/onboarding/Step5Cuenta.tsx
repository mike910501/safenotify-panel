"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { SPRING } from "@/lib/motion/springs";
import { useInvalidShake } from "./useInvalidShake";
import {
  BUSINESS_TYPE_LABELS,
  DAYS_OF_WEEK,
  step5Schema,
  type Step1Data,
  type Step2Data,
  type Step3Data,
  type Step4Data,
  type Step5Data,
} from "@/lib/onboarding/schemas";
import type { SubmitOnboardingResult } from "@/lib/actions/onboarding/submitOnboarding";

interface Step5CuentaProps {
  initialValues: Step5Data | null;
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  onSubmit: (data: Step5Data) => Promise<SubmitOnboardingResult>;
  onBack: () => void;
}

const EMAIL_EXISTS_HINT = "Este email ya tiene cuenta. ¿Quieres iniciar sesión?";

export function Step5Cuenta({
  initialValues,
  step1,
  step2,
  step3,
  step4,
  onSubmit,
  onBack,
}: Step5CuentaProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: initialValues ?? {
      email: "",
      password: "",
      confirmPassword: "",
      ownerWhatsapp: "+57",
    },
    mode: "onChange",
  });

  const openDaysCount = DAYS_OF_WEEK.filter(
    (day) => !step2.schedule[day].closed
  ).length;
  const emailAlreadyExists = serverError === EMAIL_EXISTS_HINT;
  const currentEmail = watch("email") ?? "";
  const loginHrefWithEmail = currentEmail
    ? `/login?email=${encodeURIComponent(currentEmail)}`
    : "/login";

  const { controls, shake } = useInvalidShake();

  async function onFormSubmit(data: Step5Data) {
    setServerError(null);
    const result = await onSubmit(data);
    if (!result.ok) {
      setServerError(result.error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit, shake)}
      noValidate
      className="space-y-4"
    >
      <header className="mb-2">
        <h2
          className="text-base font-semibold"
          style={{ color: "rgba(255,255,255,0.92)" }}
        >
          Crea tu cuenta
        </h2>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Último paso. Con esto activamos tu panel.
        </p>
      </header>

      <div
        className="rounded-xl px-3 py-3 text-xs"
        style={{
          background: "rgba(165,180,252,0.06)",
          border: "1px solid rgba(165,180,252,0.18)",
          color: "rgba(255,255,255,0.78)",
        }}
      >
        <p
          className="text-[10px] uppercase tracking-wider"
          style={{ color: "rgba(165,180,252,0.85)" }}
        >
          Tu negocio
        </p>
        <p className="mt-1 font-medium">{step1.businessName}</p>
        <p className="mt-0.5" style={{ color: "rgba(255,255,255,0.60)" }}>
          {BUSINESS_TYPE_LABELS[step1.businessType]} · {step1.city}
        </p>
        <p className="mt-0.5" style={{ color: "rgba(255,255,255,0.60)" }}>
          {openDaysCount} {openDaysCount === 1 ? "día abierto" : "días abiertos"}
          {" · "}
          {step4.methods.length}{" "}
          {step4.methods.length === 1 ? "método de pago" : "métodos de pago"}
          {step3.menuImageUrl ? " · menú con imagen" : ""}
        </p>
      </div>

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
          {emailAlreadyExists && (
            <Link
              href={loginHrefWithEmail}
              className="ml-1 underline transition-colors hover:text-white"
              style={{ color: "#F4A8A6" }}
            >
              Ir a iniciar sesión
            </Link>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.80)" }}
        >
          Email
        </Label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tu@correo.com"
          disabled={isSubmitting}
          {...register("email")}
          aria-invalid={!!errors.email}
          className="glass-input h-9 w-full rounded-xl px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
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
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          disabled={isSubmitting}
          {...register("password")}
          aria-invalid={!!errors.password}
          className="glass-input h-9 w-full rounded-xl px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.password && (
          <p className="text-xs" style={{ color: "#F4A8A6" }}>
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="confirmPassword"
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.80)" }}
        >
          Confirma la contraseña
        </Label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repite la contraseña"
          disabled={isSubmitting}
          {...register("confirmPassword")}
          aria-invalid={!!errors.confirmPassword}
          className="glass-input h-9 w-full rounded-xl px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.confirmPassword && (
          <p className="text-xs" style={{ color: "#F4A8A6" }}>
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="ownerWhatsapp"
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.80)" }}
        >
          WhatsApp del dueño
        </Label>
        <input
          id="ownerWhatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+573001234567"
          disabled={isSubmitting}
          {...register("ownerWhatsapp")}
          aria-invalid={!!errors.ownerWhatsapp}
          className="glass-input h-9 w-full rounded-xl px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.ownerWhatsapp && (
          <p className="text-xs" style={{ color: "#F4A8A6" }}>
            {errors.ownerWhatsapp.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <motion.button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          whileTap={{ scale: 0.96 }}
          transition={SPRING.snappy}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm disabled:pointer-events-none disabled:opacity-40"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.80)",
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </motion.button>

        <motion.button
          type="submit"
          animate={controls}
          disabled={isSubmitting}
          whileTap={{ scale: 0.96 }}
          transition={SPRING.snappy}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, var(--glow-primary), var(--glow-secondary))",
            boxShadow: isValid
              ? "0 0 24px rgba(139,92,246,0.40)"
              : "none",
            opacity: isSubmitting ? 0.85 : isValid ? 1 : 0.55,
            transition: "box-shadow 180ms ease-out, opacity 180ms ease-out",
          }}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : serverError ? (
            <RotateCcw className="h-4 w-4" />
          ) : null}
          {isSubmitting
            ? "Creando cuenta..."
            : serverError
            ? "Reintentar"
            : "Crear cuenta"}
        </motion.button>
      </div>
    </form>
  );
}
