"use client";

import { motion } from "framer-motion";
import { SPRING } from "@/lib/motion/springs";
import type { Historial } from "@/types/domain.types";

interface MessageBubbleProps {
  mensaje: Historial;
}

export function MessageBubble({ mensaje }: MessageBubbleProps) {
  const { content, enviado_por, timestamp } = mensaje;

  const esCliente = enviado_por === "cliente";
  const esHumano = enviado_por === "humano";

  const time = new Date(timestamp).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={SPRING.gentle}
      className={`flex ${esCliente ? "justify-start" : "justify-end"}`}
    >
      <div
        className="max-w-[80%] px-3 py-2 rounded-2xl break-words"
        style={{
          background: esCliente
            ? "rgba(255,255,255,0.06)"
            : esHumano
            ? "rgba(244,168,166,0.10)"
            : "rgba(184,216,138,0.08)",
          border: `1px solid ${
            esCliente
              ? "rgba(255,255,255,0.10)"
              : esHumano
              ? "rgba(244,168,166,0.25)"
              : "rgba(184,216,138,0.20)"
          }`,
        }}
      >
        {esHumano && (
          <span
            className="block text-[10px] mb-1 opacity-60"
            style={{ color: "#F4A8A6" }}
          >
            Mensaje manual del operador
          </span>
        )}
        <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
        <p
          className="mt-1 text-right text-[10px]"
          style={{ color: "rgba(255,255,255,0.40)" }}
        >
          {time}
        </p>
      </div>
    </motion.div>
  );
}
