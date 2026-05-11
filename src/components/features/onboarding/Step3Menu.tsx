"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SPRING } from "@/lib/motion/springs";
import { step3Schema, type Step3Data } from "@/lib/onboarding/schemas";
import { useInvalidShake } from "./useInvalidShake";

interface Step3MenuProps {
  initialValues: Step3Data | null;
  onSubmit: (data: Step3Data) => void;
  onBack: () => void;
}

export function Step3Menu({ initialValues, onSubmit, onBack }: Step3MenuProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: initialValues ?? { menuText: "", menuImageUrl: "" },
    mode: "onChange",
  });

  const menuText = watch("menuText") ?? "";
  const { controls, shake } = useInvalidShake();

  return (
    <form
      onSubmit={handleSubmit(onSubmit, shake)}
      noValidate
      className="space-y-4"
    >
      <header className="mb-2">
        <h2
          className="text-base font-semibold"
          style={{ color: "rgba(255,255,255,0.92)" }}
        >
          ¿Qué ofrece tu menú?
        </h2>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Escribe los productos con precios o pega un link a una imagen del menú.
        </p>
      </header>

      <div className="space-y-1.5">
        <Label
          htmlFor="menuText"
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.80)" }}
        >
          Tu menú
        </Label>
        <textarea
          id="menuText"
          rows={6}
          placeholder={
            "Hamburguesa clásica $18.000\nPerro caliente $12.000\nGaseosa $4.000\n..."
          }
          {...register("menuText")}
          aria-invalid={!!errors.menuText}
          className="glass-input w-full resize-none rounded-xl px-3 py-2 text-sm leading-relaxed"
        />
        <div
          className="flex items-center justify-between text-xs"
          style={{ color: "rgba(255,255,255,0.40)" }}
        >
          <span>{menuText.length} / 5000</span>
          {errors.menuText && (
            <span style={{ color: "#F4A8A6" }}>{errors.menuText.message}</span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="menuImageUrl"
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.80)" }}
        >
          Link a imagen del menú (opcional)
        </Label>
        <input
          id="menuImageUrl"
          type="url"
          inputMode="url"
          placeholder="https://..."
          {...register("menuImageUrl")}
          aria-invalid={!!errors.menuImageUrl}
          className="glass-input h-9 w-full rounded-xl px-3 text-sm"
        />
        {errors.menuImageUrl && (
          <p className="text-xs" style={{ color: "#F4A8A6" }}>
            {errors.menuImageUrl.message}
          </p>
        )}
      </div>

      <p
        className="text-xs leading-relaxed"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        Necesitamos al menos uno: texto o link. Después podrás ajustar tu menú
        desde la sección de Configuración.
      </p>

      <div className="flex items-center justify-between pt-2">
        <motion.button
          type="button"
          onClick={onBack}
          whileTap={{ scale: 0.96 }}
          transition={SPRING.snappy}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm"
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
          whileTap={{ scale: 0.96 }}
          transition={SPRING.snappy}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
          style={{
            background:
              "linear-gradient(to right, var(--glow-primary), var(--glow-secondary))",
            boxShadow: isValid
              ? "0 0 24px rgba(139,92,246,0.40)"
              : "none",
            opacity: isValid ? 1 : 0.55,
            transition: "box-shadow 180ms ease-out, opacity 180ms ease-out",
          }}
        >
          Siguiente
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </form>
  );
}
