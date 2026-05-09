"use client";

// TODO: implementar en feat/conversaciones
// Suscripción Realtime a historial para un (negocio_id, phone).
// En INSERT, agrega el mensaje al estado local.
// cleanup: supabase.removeChannel(channel) en return del useEffect.

import { useEffect, useState } from "react";
import type { Historial } from "@/types/domain.types";

export function useConversationRealtime(
  _negocioId: string,
  _phone: string,
  initialMessages: Historial[] = []
): Historial[] {
  const [messages, setMessages] = useState<Historial[]>(initialMessages);

  useEffect(() => {
    setMessages(initialMessages);
    // TODO: abrir canal Supabase Realtime y suscribirse a historial
    return () => {
      // cleanup: supabase.removeChannel(channel)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_negocioId, _phone]);

  return messages;
}
