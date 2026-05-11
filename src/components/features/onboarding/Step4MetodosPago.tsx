"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { SPRING } from "@/lib/motion/springs";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  step4Schema,
  type PaymentMethod,
  type Step4Data,
} from "@/lib/onboarding/schemas";
import { useInvalidShake } from "./useInvalidShake";

interface Step4MetodosPagoProps {
  initialValues: Step4Data | null;
  onSubmit: (data: Step4Data) => void;
  onBack: () => void;
}

export function Step4MetodosPago({
  initialValues,
  onSubmit,
  onBack,
}: Step4MetodosPagoProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: initialValues ?? { methods: [] },
    mode: "onChange",
  });

  const methods = watch("methods") ?? [];
  const { controls, shake } = useInvalidShake();

  function toggleMethod(method: PaymentMethod) {
    const next = methods.includes(method)
      ? methods.filter((m) => m !== method)
      : [...methods, method];
    setValue("methods", next, { shouldValidate: true });
  }

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
          ¿Cómo aceptas pagos?
        </h2>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Marca todos los que aplican. Tu bot informará al cliente al cerrar el pedido.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        {PAYMENT_METHODS.map((method) => {
          const selected = methods.includes(method);
          return (
            <motion.button
              key={method}
              type="button"
              onClick={() => toggleMethod(method)}
              whileTap={{ scale: 0.96 }}
              transition={SPRING.snappy}
              className="relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium"
              style={{
                background: selected
                  ? "rgba(196,181,253,0.18)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  selected
                    ? "rgba(196,181,253,0.55)"
                    : "rgba(255,255,255,0.10)"
                }`,
                color: selected ? "#C4B5FD" : "rgba(255,255,255,0.75)",
                boxShadow: selected
                  ? "0 0 14px rgba(196,181,253,0.30)"
                  : "none",
                transition:
                  "background 180ms ease-out, border-color 180ms ease-out, color 180ms ease-out, box-shadow 180ms ease-out",
              }}
            >
              <div
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md"
                style={{
                  background: selected
                    ? "rgba(196,181,253,0.30)"
                    : "rgba(255,255,255,0.06)",
                  border: `1px solid ${
                    selected
                      ? "rgba(196,181,253,0.70)"
                      : "rgba(255,255,255,0.18)"
                  }`,
                }}
              >
                {selected && <Check className="h-3 w-3" />}
              </div>
              <span className="flex-1 truncate">
                {PAYMENT_METHOD_LABELS[method]}
              </span>
            </motion.button>
          );
        })}
      </div>

      {errors.methods && (
        <p className="text-xs" style={{ color: "#F4A8A6" }}>
          {errors.methods.message}
        </p>
      )}

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
