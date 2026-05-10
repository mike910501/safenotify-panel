"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationListItem } from "./ConversationListItem";
import { useChatsRealtime } from "@/lib/hooks/useChatsRealtime";
import { SPRING } from "@/lib/motion/springs";
import type { ChatActivo } from "@/types/domain.types";

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

interface ConversationListProps {
  initialChats: ChatActivo[];
  negocioId: string | null;
  rol: "admin" | "owner" | "operator";
}

export function ConversationList({
  initialChats,
  negocioId,
  rol,
}: ConversationListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPhone = searchParams.get("phone");

  const [chats, setChats] = useState<ChatActivo[]>(initialChats);
  const [query, setQuery] = useState("");

  useChatsRealtime({ negocioId, rol, onChange: setChats });

  const filtered = chats.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (c.phone ?? "").toLowerCase().includes(q) ||
      (c.ultimo_mensaje ?? "").toLowerCase().includes(q)
    );
  });

  function handleSelect(phone: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("phone", phone);
    router.push(`/conversaciones?${params.toString()}`);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search glassmorphism */}
      <div
        className="px-3 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="relative">
          <Search
            className="absolute left-2.5 top-2.5 h-4 w-4 pointer-events-none"
            style={{ color: "rgba(255,255,255,0.40)" }}
          />
          <input
            type="search"
            placeholder="Buscar conversación..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="glass-input h-9 w-full rounded-xl pl-8 pr-3 text-sm transition-all duration-200 ease-out"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {filtered.length === 0 ? (
          query ? (
            <p
              className="px-3 py-8 text-center text-sm"
              style={{ color: "rgba(255,255,255,0.50)" }}
            >
              No hay conversaciones que coincidan.
            </p>
          ) : (
            /* Empty state glassmorphism */
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
              <MessageCircle
                className="h-16 w-16"
                style={{
                  color: "rgba(255,255,255,0.30)",
                  filter: "drop-shadow(0 0 24px rgba(139,92,246,0.40))",
                  animation: "iconPulse 3s ease-in-out infinite",
                }}
              />
              <div className="space-y-1">
                <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.70)" }}>
                  Aún no hay conversaciones.
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>
                  Cuando tus clientes escriban al WhatsApp, aparecerán aquí.
                </p>
              </div>
            </div>
          )
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((chat) => (
              <motion.div
                key={`${chat.negocio_id}-${chat.phone}`}
                variants={itemVariants}
                transition={SPRING.gentle}
              >
                <ConversationListItem
                  chat={chat}
                  isSelected={selectedPhone === chat.phone}
                  onClick={() => chat.phone && handleSelect(chat.phone)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="px-3 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Skeleton className="h-9 w-full rounded-xl opacity-20" />
      </div>
      <div className="flex-1 px-2 py-2 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-3 py-3">
            <Skeleton className="h-9 w-9 rounded-full shrink-0 opacity-20" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4 rounded opacity-20" />
              <Skeleton className="h-3 w-full rounded opacity-20" />
              <Skeleton className="h-4 w-16 rounded-full opacity-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
