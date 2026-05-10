"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Historial } from "@/types/domain.types";

interface UseConversationRealtimeParams {
  negocioId: string;
  phone: string;
  onNewMessage: (mensaje: Historial) => void;
}

export function useConversationRealtime({
  negocioId,
  phone,
  onNewMessage,
}: UseConversationRealtimeParams): void {
  // Stable ref to callback to avoid unnecessary effect reruns.
  const onNewMessageRef = useRef(onNewMessage);
  onNewMessageRef.current = onNewMessage;

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`conversation-${negocioId}-${phone}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "historial",
          // Supabase Realtime filter: filtrar por negocio_id.
          // El filtro adicional por phone se aplica client-side abajo.
          filter: `negocio_id=eq.${negocioId}`,
        },
        (payload) => {
          const row = payload.new as Historial;
          // Filtro client-side por phone para no mezclar chats del mismo negocio.
          if (row.phone === phone) {
            onNewMessageRef.current(row);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [negocioId, phone]);
}
