"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Pause, Play } from "lucide-react";
import { pauseBot, unpauseBot } from "@/lib/actions/pauseBot";

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

  if (botPausado) {
    return (
      <button
        type="button"
        onClick={handleUnpause}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 transition-all duration-200 ease-out hover:-translate-y-[1px] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
        style={{
          minHeight: "44px",
          background: "rgba(244,168,166,0.10)",
          border: "1px solid rgba(244,168,166,0.30)",
          color: "#F4A8A6",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(244,168,166,0.20)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 0 20px rgba(244,168,166,0.45)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(244,168,166,0.10)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        <Play className="h-4 w-4 shrink-0" />
        <span className="hidden md:inline text-xs font-medium">
          {isPending ? "Devolviendo..." : "Devolver al bot"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePause}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 transition-all duration-200 ease-out hover:-translate-y-[1px] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
      style={{
        minHeight: "44px",
        background: "rgba(250,224,184,0.10)",
        border: "1px solid rgba(250,224,184,0.30)",
        color: "#FAE0B8",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(250,224,184,0.18)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 0 18px rgba(250,224,184,0.30)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(250,224,184,0.10)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
      }}
    >
      <Pause className="h-4 w-4 shrink-0" />
      <span className="hidden md:inline text-xs font-medium">
        {isPending ? "Tomando control..." : "Tomar el control"}
      </span>
    </button>
  );
}
