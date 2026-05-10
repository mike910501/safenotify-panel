"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface SesionPausadaRow {
  phone: string;
  pausado_hasta: string;
}

interface UsePausaConversacionParams {
  negocioId: string;
  phone: string;
  botPausadoInicial: boolean;
}

export function usePausaConversacion({
  negocioId,
  phone,
  botPausadoInicial,
}: UsePausaConversacionParams): boolean {
  const [botPausado, setBotPausado] = useState<boolean>(botPausadoInicial);

  // Sincronizar estado cuando el usuario navega a otra conversación.
  // botPausadoInicial intencionalmente FUERA de deps: solo re-sincronizar
  // cuando cambia la conversación (phone/negocioId). Si está en deps, pisa
  // el valor que Realtime acaba de actualizar.
  useEffect(() => {
    setBotPausado(botPausadoInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocioId, phone]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`pausa-${negocioId}-${phone}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sesiones_pausadas",
          filter: `negocio_id=eq.${negocioId}`,
        },
        (payload) => {
          // Filtro client-side por phone: la pausa que toca este chat es la
          // única relevante. Otros phones del mismo negocio se ignoran.
          if (payload.eventType === "DELETE") {
            const oldRow = payload.old as Partial<SesionPausadaRow>;
            if (String(oldRow.phone) === String(phone)) {
              setBotPausado(false);
            }
            return;
          }

          const row = payload.new as SesionPausadaRow;
          if (String(row.phone) !== String(phone)) return;

          const pausadoHasta = new Date(row.pausado_hasta).getTime();
          setBotPausado(pausadoHasta > Date.now());
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [negocioId, phone]);

  return botPausado;
}
