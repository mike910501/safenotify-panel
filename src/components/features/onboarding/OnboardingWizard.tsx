"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { toast } from "sonner";
import { useWizardPersistence } from "@/lib/hooks/useWizardPersistence";
import { SPRING } from "@/lib/motion/springs";
import { Step1Negocio } from "./Step1Negocio";
import { Step2Horarios } from "./Step2Horarios";
import { Step3Menu } from "./Step3Menu";
import { Step4MetodosPago } from "./Step4MetodosPago";
import { Step5Cuenta } from "./Step5Cuenta";
import { WizardProgress } from "./WizardProgress";
import {
  submitOnboarding,
  type SubmitOnboardingResult,
} from "@/lib/actions/onboarding/submitOnboarding";
import type {
  OnboardingPayload,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
} from "@/lib/onboarding/schemas";

const TOTAL_STEPS = 5;
const STORAGE_KEY = "onboarding_wizard_v1";

type StepNumber = 1 | 2 | 3 | 4 | 5;

interface PersistedWizardState {
  currentStep: StepNumber;
  step1: Step1Data | null;
  step2: Step2Data | null;
  step3: Step3Data | null;
  step4: Step4Data | null;
  // step5 is NOT persisted: contains password.
}

const INITIAL_STATE: PersistedWizardState = {
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
  5: "Cuenta",
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
  const router = useRouter();
  const { value, setValue, clear, hydrated, wasReset } =
    useWizardPersistence<PersistedWizardState>(STORAGE_KEY, INITIAL_STATE);
  const [direction, setDirection] = useState(1);
  // step5 (credentials) is kept in memory only — never persisted.
  const [step5InMemory, setStep5InMemory] = useState<Step5Data | null>(null);

  // Notify the user once when the hook just discarded expired/version-mismatched data.
  useEffect(() => {
    if (wasReset) {
      toast.info("Tu progreso anterior expiró. Empezamos de nuevo.");
    }
  }, [wasReset]);

  // Defensive: if persisted state lands us on a later step without the
  // earlier data (manual localStorage edit, schema migration), rewind to 1.
  useEffect(() => {
    if (!hydrated) return;
    const corrupted =
      (value.currentStep >= 2 && !value.step1) ||
      (value.currentStep >= 3 && !value.step2) ||
      (value.currentStep >= 4 && !value.step3) ||
      (value.currentStep >= 5 && !value.step4);
    if (corrupted) {
      setValue((prev) => ({ ...prev, currentStep: 1 }));
    }
  }, [
    hydrated,
    value.currentStep,
    value.step1,
    value.step2,
    value.step3,
    value.step4,
    setValue,
  ]);

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
    setDirection(1);
    setValue((prev) => ({ ...prev, step4: data, currentStep: 5 }));
  }

  async function handleStep5Submit(
    data: Step5Data
  ): Promise<SubmitOnboardingResult> {
    setStep5InMemory(data);

    if (!value.step1 || !value.step2 || !value.step3 || !value.step4) {
      return {
        ok: false,
        error: "Faltan datos de pasos anteriores. Vuelve a empezar el registro.",
      };
    }

    const payload: OnboardingPayload = {
      step1: value.step1,
      step2: value.step2,
      step3: value.step3,
      step4: value.step4,
      step5: data,
    };

    const result = await submitOnboarding(payload);

    if (result.ok) {
      clear();
      setStep5InMemory(null);
      router.push("/onboarding/completado");
    }

    return result;
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
            {value.currentStep === 5 &&
              value.step1 &&
              value.step2 &&
              value.step3 &&
              value.step4 && (
                <Step5Cuenta
                  initialValues={step5InMemory}
                  step1={value.step1}
                  step2={value.step2}
                  step3={value.step3}
                  step4={value.step4}
                  onSubmit={handleStep5Submit}
                  onBack={() => goTo(4)}
                />
              )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
