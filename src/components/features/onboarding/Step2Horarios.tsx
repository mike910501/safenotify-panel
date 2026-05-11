"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SPRING } from "@/lib/motion/springs";
import {
  DAYS_OF_WEEK,
  DAY_OF_WEEK_LABELS,
  step2Schema,
  type DayOfWeek,
  type Step2Data,
} from "@/lib/onboarding/schemas";

interface Step2HorariosProps {
  initialValues: Step2Data | null;
  onSubmit: (data: Step2Data) => void;
  onBack: () => void;
}

const DEFAULT_SCHEDULE: Step2Data = {
  schedule: {
    lunes: { closed: false, openTime: "10:00", closeTime: "22:00" },
    martes: { closed: false, openTime: "10:00", closeTime: "22:00" },
    miercoles: { closed: false, openTime: "10:00", closeTime: "22:00" },
    jueves: { closed: false, openTime: "10:00", closeTime: "22:00" },
    viernes: { closed: false, openTime: "10:00", closeTime: "22:00" },
    sabado: { closed: false, openTime: "10:00", closeTime: "22:00" },
    domingo: { closed: false, openTime: "10:00", closeTime: "22:00" },
  },
};

export function Step2Horarios({
  initialValues,
  onSubmit,
  onBack,
}: Step2HorariosProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: initialValues ?? DEFAULT_SCHEDULE,
    mode: "onChange",
  });

  const schedule = watch("schedule");

  function toggleDay(day: DayOfWeek) {
    setValue(`schedule.${day}.closed`, !schedule[day].closed, {
      shouldValidate: true,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <header className="mb-2">
        <h2
          className="text-base font-semibold"
          style={{ color: "rgba(255,255,255,0.92)" }}
        >
          ¿En qué horarios atiendes?
        </h2>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Tu bot responderá según esto. Marca como cerrado los días que no abres.
        </p>
      </header>

      <div className="space-y-2">
        {DAYS_OF_WEEK.map((day) => {
          const dayData = schedule[day];
          const dayError = errors.schedule?.[day];
          const errorMessage =
            dayError?.message ??
            dayError?.openTime?.message ??
            dayError?.closeTime?.message ??
            null;

          return (
            <div key={day}>
              <div className="flex items-center gap-2">
                <div
                  className="w-16 shrink-0 text-xs font-medium"
                  style={{ color: "rgba(255,255,255,0.80)" }}
                >
                  {DAY_OF_WEEK_LABELS[day]}
                </div>

                <motion.button
                  type="button"
                  onClick={() => toggleDay(day)}
                  whileTap={{ scale: 0.94 }}
                  transition={SPRING.snappy}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                  style={{
                    background: dayData.closed
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(184,216,138,0.14)",
                    border: `1px solid ${
                      dayData.closed
                        ? "rgba(255,255,255,0.10)"
                        : "rgba(184,216,138,0.42)"
                    }`,
                    color: dayData.closed
                      ? "rgba(255,255,255,0.50)"
                      : "#B8D88A",
                    transition:
                      "background 180ms ease-out, border-color 180ms ease-out, color 180ms ease-out",
                  }}
                >
                  {dayData.closed ? "Cerrado" : "Abierto"}
                </motion.button>

                {!dayData.closed && (
                  <div className="flex flex-1 items-center gap-1">
                    <input
                      type="time"
                      aria-label={`Apertura ${DAY_OF_WEEK_LABELS[day]}`}
                      {...register(`schedule.${day}.openTime`)}
                      className="glass-input h-8 min-w-0 flex-1 rounded-lg px-1.5 text-xs"
                    />
                    <span
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.40)" }}
                    >
                      —
                    </span>
                    <input
                      type="time"
                      aria-label={`Cierre ${DAY_OF_WEEK_LABELS[day]}`}
                      {...register(`schedule.${day}.closeTime`)}
                      className="glass-input h-8 min-w-0 flex-1 rounded-lg px-1.5 text-xs"
                    />
                  </div>
                )}
              </div>

              {errorMessage && (
                <p
                  className="mt-1 pl-[72px] text-xs"
                  style={{ color: "#F4A8A6" }}
                >
                  {errorMessage}
                </p>
              )}
            </div>
          );
        })}
      </div>

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
          disabled={!isValid}
          whileTap={{ scale: 0.96 }}
          transition={SPRING.snappy}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:pointer-events-none disabled:opacity-40"
          style={{
            background:
              "linear-gradient(to right, var(--glow-primary), var(--glow-secondary))",
            boxShadow: "0 0 24px rgba(139,92,246,0.40)",
          }}
        >
          Siguiente
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </form>
  );
}
