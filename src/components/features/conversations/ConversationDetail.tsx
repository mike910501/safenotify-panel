"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useConversationRealtime } from "@/lib/hooks/useConversationRealtime";
import { usePausaConversacion } from "@/lib/hooks/usePausaConversacion";
import { MessageBubble } from "./MessageBubble";
import { PauseControls } from "./PauseControls";
import { ManualMessageInput } from "./ManualMessageInput";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, formatPhone, phoneToGradient } from "@/lib/utils";
import type { Historial } from "@/types/domain.types";

interface ConversationDetailProps {
  phone: string;
  negocioId: string;
  botPausado: boolean;
}

export function ConversationDetail({
  phone,
  negocioId,
  botPausado,
}: ConversationDetailProps) {
  const [mensajes, setMensajes] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const botPausadoActual = usePausaConversacion({
    negocioId,
    phone,
    botPausadoInicial: botPausado,
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchHistorial() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("historial")
        .select("id, negocio_id, phone, role, content, enviado_por, timestamp")
        .eq("negocio_id", negocioId)
        .eq("phone", phone)
        .order("timestamp", { ascending: true })
        .limit(500);

      if (!cancelled) {
        if (!error && data) {
          setMensajes(data as Historial[]);
        }
        setLoading(false);
      }
    }

    fetchHistorial();
    return () => { cancelled = true; };
  }, [negocioId, phone]);

  useConversationRealtime({
    negocioId,
    phone,
    onNewMessage: (m) => setMensajes((prev) => [...prev, m]),
  });

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes]);

  const initials = getInitials(phone);
  const avatarGradient = phoneToGradient(phone);

  return (
    <div className="flex h-full flex-col">
      {/* Header glassmorphism */}
      <div
        className="relative flex items-center justify-between gap-3 px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid transparent",
        }}
      >
        {/* Separador gradient debajo del header */}
        <div
          className="absolute bottom-0 inset-x-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(139,92,246,0.40), transparent)",
          }}
        />

        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-sm font-medium"
            style={{ background: avatarGradient }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {phone}
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
              {formatPhone(phone)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PauseControls
            phone={phone}
            negocioId={negocioId}
            botPausado={botPausadoActual}
          />
        </div>
      </div>

      {/* Messages — fondo transparente para que se vea el gradiente del dashboard */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-transparent">
        {loading ? (
          <ConversationDetailSkeleton />
        ) : mensajes.length === 0 ? (
          /* Empty state sin chat seleccionado */
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
            <p
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.50)" }}
            >
              No hay mensajes en esta conversación.
            </p>
          </div>
        ) : (
          mensajes.map((m) => <MessageBubble key={m.id} mensaje={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input footer */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <ManualMessageInput phone={phone} negocioId={negocioId} />
      </div>
    </div>
  );
}

function ConversationDetailSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex justify-start">
        <Skeleton className="h-14 w-2/3 rounded-xl opacity-20" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-1/2 rounded-xl opacity-20" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-10 w-1/3 rounded-xl opacity-20" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-16 w-2/3 rounded-xl opacity-20" />
      </div>
    </div>
  );
}
