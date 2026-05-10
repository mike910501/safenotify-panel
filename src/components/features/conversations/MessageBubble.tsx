import { cn } from "@/lib/utils";
import type { Historial } from "@/types/domain.types";

interface MessageBubbleProps {
  mensaje: Historial;
}

export function MessageBubble({ mensaje }: MessageBubbleProps) {
  const { role, content, enviado_por, timestamp } = mensaje;

  const isCliente = role === "user";
  const isHumano = role === "assistant" && enviado_por === "humano";
  const isBot = role === "assistant" && enviado_por !== "humano";

  const time = new Date(timestamp).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex group",
        // Animación de entrada — NO backdrop-blur en burbujas por performance
        "motion-safe:[animation:messageEntry_350ms_cubic-bezier(0.34,1.56,0.64,1)_both]",
        "animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out",
        isCliente ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
          // Animación de glow de entrada (solo en el div interno)
          "motion-safe:[animation:messageEntry_350ms_cubic-bezier(0.34,1.56,0.64,1)_both,messageGlow_600ms_ease-out_both]",
          // Asimetría tipo chat
          isCliente && "rounded-bl-sm",
          (isBot || isHumano) && "rounded-br-sm"
        )}
        style={
          isCliente
            ? {
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#FFFFFF",
              }
            : isBot
            ? {
                background:
                  "linear-gradient(to bottom right, rgba(184,216,138,0.15), rgba(184,216,138,0.05))",
                border: "1px solid rgba(184,216,138,0.25)",
                color: "#DCEAC4",
              }
            : {
                background:
                  "linear-gradient(to bottom right, rgba(250,224,184,0.18), rgba(244,168,166,0.08))",
                border: "1px solid rgba(244,168,166,0.25)",
                color: "#FAE0B8",
              }
        }
      >
        {isHumano && (
          <p
            className="mb-1 text-[11px] font-medium"
            style={{ color: "rgba(250,224,184,0.70)" }}
          >
            Mensaje manual del operador
          </p>
        )}
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </p>
        {/* Timestamp: visible al hover del wrapper con `group` */}
        <p
          className="mt-1 text-right text-[10px] transition-colors duration-150"
          style={{
            color: "rgba(255,255,255,0.40)",
          }}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
