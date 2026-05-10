"use client";

import { useTransition, useRef } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { sendMessage } from "@/lib/actions/sendMessage";

interface ManualMessageInputProps {
  phone: string;
  negocioId: string;
}

export function ManualMessageInput({ phone, negocioId }: ManualMessageInputProps) {
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const contenido = inputRef.current?.value ?? "";
    if (!contenido.trim()) return;

    startTransition(async () => {
      const result = await sendMessage({ phone, negocioId, contenido });
      if (result.ok) {
        toast.success("Mensaje enviado");
        if (inputRef.current) inputRef.current.value = "";
      } else {
        toast.error("No se pudo enviar el mensaje. Intenta de nuevo.");
      }
    });
  }

  return (
    <div className="px-4 py-3 bg-transparent">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          name="contenido"
          placeholder="Escribe un mensaje manual..."
          disabled={isPending}
          autoComplete="off"
          maxLength={1000}
          className="glass-input flex-1 h-9 rounded-xl px-3 text-sm transition-all duration-200 ease-out disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-[1px] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
          style={{
            background: "linear-gradient(to right, #7BB857, #B8D88A)",
            color: "#0A0E27",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 24px rgba(184,216,138,0.50)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isPending ? "Enviando..." : "Enviar"}
          </span>
        </button>
      </form>
    </div>
  );
}
