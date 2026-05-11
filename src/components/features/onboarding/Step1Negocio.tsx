"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SPRING } from "@/lib/motion/springs";
import {
  BUSINESS_TYPES,
  BUSINESS_TYPE_LABELS,
  step1Schema,
  type Step1Data,
} from "@/lib/onboarding/schemas";
import { useInvalidShake } from "./useInvalidShake";

interface Step1NegocioProps {
  initialValues: Step1Data | null;
  onSubmit: (data: Step1Data) => void;
}

export function Step1Negocio({ initialValues, onSubmit }: Step1NegocioProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: initialValues ?? {
      businessName: "",
      address: "",
      city: "",
    },
    mode: "onChange",
  });

  const businessType = watch("businessType");
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
          Cuéntanos sobre tu negocio
        </h2>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Información básica que verán tus clientes.
        </p>
      </header>

      <div className="space-y-1.5">
        <Label
          htmlFor="businessName"
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.80)" }}
        >
          Nombre del negocio
        </Label>
        <input
          id="businessName"
          type="text"
          autoComplete="organization"
          placeholder="Pizzería La Esquina"
          {...register("businessName")}
          aria-invalid={!!errors.businessName}
          className="glass-input h-9 w-full rounded-xl px-3 text-sm"
        />
        {errors.businessName && (
          <p className="text-xs" style={{ color: "#F4A8A6" }}>
            {errors.businessName.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.80)" }}
        >
          Tipo de negocio
        </Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BUSINESS_TYPES.map((type) => {
            const selected = businessType === type;
            return (
              <motion.button
                key={type}
                type="button"
                whileTap={{ scale: 0.96 }}
                transition={SPRING.snappy}
                onClick={() =>
                  setValue("businessType", type, { shouldValidate: true })
                }
                className="rounded-xl px-3 py-2.5 text-xs font-medium"
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
                {BUSINESS_TYPE_LABELS[type]}
              </motion.button>
            );
          })}
        </div>
        {errors.businessType && (
          <p className="text-xs" style={{ color: "#F4A8A6" }}>
            {errors.businessType.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="address"
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.80)" }}
        >
          Dirección
        </Label>
        <input
          id="address"
          type="text"
          autoComplete="street-address"
          placeholder="Calle 50 # 20-15"
          {...register("address")}
          aria-invalid={!!errors.address}
          className="glass-input h-9 w-full rounded-xl px-3 text-sm"
        />
        {errors.address && (
          <p className="text-xs" style={{ color: "#F4A8A6" }}>
            {errors.address.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="city"
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.80)" }}
        >
          Ciudad
        </Label>
        <input
          id="city"
          type="text"
          autoComplete="address-level2"
          placeholder="Bucaramanga"
          {...register("city")}
          aria-invalid={!!errors.city}
          className="glass-input h-9 w-full rounded-xl px-3 text-sm"
        />
        {errors.city && (
          <p className="text-xs" style={{ color: "#F4A8A6" }}>
            {errors.city.message}
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2">
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
