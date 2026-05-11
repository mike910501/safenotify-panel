"use client";

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useWizardPersistence } from "@/lib/hooks/useWizardPersistence";
import { SPRING } from "@/lib/motion/springs";
import { Step1Negocio } from "./Step1Negocio";
import { Step2Horarios } from "./Step2Horarios";
import { Step3Menu } from "./Step3Menu";
import { Step4MetodosPago } from "./Step4MetodosPago";
import { WizardProgress } from "./WizardProgress";
import type {
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
} from "@/lib/onboarding/schemas";

const TOTAL_STEPS = 4;
const STORAGE_KEY = "onboarding_wizard_v1";

type StepNumber = 1 | 2 | 3 | 4;

interface WizardState {
  currentStep: StepNumber;
  step1: Step1Data | null;
  step2: Step2Data | null;
  step3: Step3Data | null;
  step4: Step4Data | null;
}

const INITIAL_STATE: WizardState = {
  currentStep: 1,
  step1: null,
  step2: null,
  step3: null,
  step4: null,
};

const STEP_LABELS: Record<StepNumber, string> = {
  1: "Tu negocio",
  2: "Horarios",
  3: "Menú",
  4: "Pagos",
};

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

export function OnboardingWizard() {
  const { value, setValue, hydrated } = useWizardPersistence<WizardState>(
    STORAGE_KEY,
    INITIAL_STATE
  );
  const [direction, setDirection] = useState(1);

  // Avoid hydration mismatch: server and client both render the placeholder
  // until localStorage read completes on the client.
  if (!hydrated) {
    return <div className="min-h-[420px]" />;
  }

  function goTo(step: StepNumber) {
    setDirection(step > value.currentStep ? 1 : -1);
    setValue((prev) => ({ ...prev, currentStep: step }));
  }

  function handleStep1Submit(data: Step1Data) {
    setDirection(1);
    setValue((prev) => ({ ...prev, step1: data, currentStep: 2 }));
  }

  function handleStep2Submit(data: Step2Data) {
    setDirection(1);
    setValue((prev) => ({ ...prev, step2: data, currentStep: 3 }));
  }

  function handleStep3Submit(data: Step3Data) {
    setDirection(1);
    setValue((prev) => ({ ...prev, step3: data, currentStep: 4 }));
  }

  function handleStep4Submit(data: Step4Data) {
    // Phase 4 will wire the actual account-creation server action.
    // For now, persist the captured step and stay on the page.
    setValue((prev) => ({ ...prev, step4: data }));
  }

  return (
    <div>
      <WizardProgress
        currentStep={value.currentStep}
        totalSteps={TOTAL_STEPS}
        stepLabel={STEP_LABELS[value.currentStep]}
      />

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={value.currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={SPRING.smooth}
          >
            {value.currentStep === 1 && (
              <Step1Negocio
                initialValues={value.step1}
                onSubmit={handleStep1Submit}
              />
            )}
            {value.currentStep === 2 && (
              <Step2Horarios
                initialValues={value.step2}
                onSubmit={handleStep2Submit}
                onBack={() => goTo(1)}
              />
            )}
            {value.currentStep === 3 && (
              <Step3Menu
                initialValues={value.step3}
                onSubmit={handleStep3Submit}
                onBack={() => goTo(2)}
              />
            )}
            {value.currentStep === 4 && (
              <Step4MetodosPago
                initialValues={value.step4}
                onSubmit={handleStep4Submit}
                onBack={() => goTo(3)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
