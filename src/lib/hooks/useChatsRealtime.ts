"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatActivo } from "@/types/domain.types";

interface UseChatsRealtimeParams {
  negocioId: string | null;
  rol: "admin" | "owner" | "operator";
  onChange: (chats: ChatActivo[]) => void;
}

export function useChatsRealtime({
  negocioId,
  rol,
  onChange,
}: UseChatsRealtimeParams): void {
  // Stable ref to onChange to avoid unnecessary effect reruns.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const supabase = createClient();

    // Debounce timer ref to batch rapid events.
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    async function refetch() {
      let query = supabase
        .from("chats_activos")
        .select("*")
        .order("ultimo_mensaje_at", { ascending: false });

      if (rol !== "admin" && negocioId) {
        query = query.eq("negocio_id", negocioId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("[useChatsRealtime] refetch error:", error);
        return;
      }
      onChangeRef.current((data as ChatActivo[]) ?? []);
    }

    function scheduleRefetch() {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(refetch, 200);
    }

    const filterExpr =
      rol !== "admin" && negocioId ? `negocio_id=eq.${negocioId}` : undefined;

    const channel = supabase
      .channel("chats-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "historial",
          ...(filterExpr ? { filter: filterExpr } : {}),
        },
        scheduleRefetch
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sesiones_pausadas",
          ...(filterExpr ? { filter: filterExpr } : {}),
        },
        scheduleRefetch
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
          ...(filterExpr ? { filter: filterExpr } : {}),
        },
        scheduleRefetch
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [negocioId, rol]);
}
