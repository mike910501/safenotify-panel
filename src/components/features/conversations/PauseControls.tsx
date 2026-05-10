"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pauseBot, unpauseBot } from "@/lib/actions/pauseBot";
import { SPRING } from "@/lib/motion/springs";

interface PauseControlsProps {
  phone: string;
  negocioId: string;
  botPausado: boolean;
}

export function PauseControls({ phone, negocioId, botPausado }: PauseControlsProps) {
  const [isPending, startTransition] = useTransition();

  function handlePause() {
    startTransition(async () => {
      const result = await pauseBot({ phone, negocioId });
      if (result.ok) {
        toast.success("Tomaste el control de la conversación.");
      } else {
        toast.error("No se pudo realizar la acción. Intenta de nuevo.");
      }
    });
  }

  function handleUnpause() {
    startTransition(async () => {
      const result = await unpauseBot({ phone, negocioId });
      if (result.ok) {
        toast.success("Bot reactivado, ya responde de nuevo.");
      } else {
        toast.error("No se pudo realizar la acción. Intenta de nuevo.");
      }
    });
  }

  return (
    <motion.button
      type="button"
      onClick={botPausado ? handleUnpause : handlePause}
      disabled={isPending}
      whileTap={{ scale: 0.92 }}
      transition={SPRING.snappy}
      animate={{
        background: botPausado
          ? "rgba(244,168,166,0.15)"
          : "rgba(250,224,184,0.12)",
        borderColor: botPausado
          ? "rgba(244,168,166,0.40)"
          : "rgba(250,224,184,0.30)",
        boxShadow: botPausado
          ? "0 0 20px rgba(244,168,166,0.35)"
          : "0 0 0px rgba(0,0,0,0)",
      }}
      className="relative h-11 w-11 md:w-auto md:px-3 rounded-xl border flex items-center justify-center gap-1.5 disabled:pointer-events-none disabled:opacity-50"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={botPausado ? "play" : "pause"}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={SPRING.snappy}
          className="flex items-center"
          style={{ color: botPausado ? "#F4A8A6" : "#FAE0B8" }}
        >
          {botPausado ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </motion.span>
      </AnimatePresence>

      <span
        className="hidden md:inline text-xs font-medium"
        style={{ color: botPausado ? "#F4A8A6" : "#FAE0B8" }}
      >
        {isPending
          ? botPausado
            ? "Devolviendo..."
            : "Tomando control..."
          : botPausado
          ? "Devolver al bot"
          : "Tomar el control"}
      </span>
    </motion.button>
  );
}
