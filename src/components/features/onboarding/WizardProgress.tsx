"use client";

import { motion } from "framer-motion";
import { SPRING } from "@/lib/motion/springs";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
}

export function WizardProgress({
  currentStep,
  totalSteps,
  stepLabel,
}: WizardProgressProps) {
  const fillPercent = Math.min(100, (currentStep / totalSteps) * 100);

  return (
    <div className="mb-6">
      <div
        className="mb-2 flex items-center justify-between text-xs"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        <span>
          Paso {currentStep} de {totalSteps}
        </span>
        <span style={{ color: "rgba(255,255,255,0.75)" }}>{stepLabel}</span>
      </div>
      <div
        className="relative h-1 w-full overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <motion.div
          layoutId="wizard-progress-bar"
          className="absolute inset-y-0 left-0 rounded-full"
          animate={{ width: `${fillPercent}%` }}
          transition={SPRING.smooth}
          style={{
            background: "linear-gradient(to right, #A5B4FC, #C4B5FD)",
            boxShadow: "0 0 12px rgba(196,181,253,0.55)",
          }}
        />
      </div>
    </div>
  );
}
