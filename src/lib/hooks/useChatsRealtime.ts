"use client";

// TODO: implementar en feat/conversaciones
// Suscripción a historial, sesiones_pausadas y pedidos.
// En cualquier evento, refetch de chats_activos con SELECT.
// Ver patrón "Patrón para vistas: refetch on event" en ARCHITECTURE.md §7.6

import { useEffect, useState } from "react";
import type { ChatActivo } from "@/types/domain.types";

export function useChatsRealtime(
  _negocioId: string,
  initialChats: ChatActivo[] = []
): ChatActivo[] {
  const [chats, setChats] = useState<ChatActivo[]>(initialChats);

  useEffect(() => {
    setChats(initialChats);
    // TODO: abrir canales en historial, sesiones_pausadas, pedidos
    // y refetch chats_activos en cada evento
    return () => {
      // cleanup: supabase.removeAllChannels()
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_negocioId]);

  return chats;
}
