import { redirect } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { ConversationList } from "@/components/features/conversations/ConversationList";
import { ConversationDetail } from "@/components/features/conversations/ConversationDetail";
import type { ChatActivo } from "@/types/domain.types";

interface ConversacionesPageProps {
  searchParams: Promise<{ phone?: string }>;
}

export default async function ConversacionesPage({
  searchParams,
}: ConversacionesPageProps) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  const { phone: selectedPhone } = await searchParams;

  // Carga inicial de chats_activos.
  const supabase = await createClient();
  let query = supabase
    .from("chats_activos")
    .select("*")
    .order("ultimo_mensaje_at", { ascending: false });

  if (usuario.rol !== "admin") {
    query = query.eq("negocio_id", usuario.negocioId);
  }

  const { data: chats } = await query;
  const initialChats: ChatActivo[] = (chats as ChatActivo[]) ?? [];

  // Buscar el chat seleccionado para obtener bot_pausado.
  const selectedChat = selectedPhone
    ? initialChats.find((c) => c.phone === selectedPhone) ?? null
    : null;

  return (
    <div className="flex h-full">
      {/* Sidebar de lista — glassmorphism */}
      <aside
        className={`w-[280px] shrink-0 flex flex-col h-full ${
          selectedPhone ? "hidden md:flex" : "flex"
        }`}
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-sm font-medium text-white">
            Conversaciones
          </h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <ConversationList
            initialChats={initialChats}
            negocioId={usuario.rol === "admin" ? null : usuario.negocioId}
            rol={usuario.rol}
          />
        </div>
      </aside>

      {/* Panel de detalle */}
      <main
        className={`flex-1 h-full overflow-hidden ${
          selectedPhone ? "flex" : "hidden md:flex"
        } flex-col bg-transparent`}
      >
        {selectedPhone ? (
          <ConversationDetail
            phone={selectedPhone}
            negocioId={
              selectedChat?.negocio_id ??
              (usuario.rol !== "admin" ? usuario.negocioId : "")
            }
            botPausado={selectedChat?.bot_pausado ?? false}
          />
        ) : (
          /* Empty state cuando no hay chat seleccionado */
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-8">
            <MessagesSquare
              className="h-16 w-16"
              style={{
                color: "rgba(255,255,255,0.30)",
                filter: "drop-shadow(0 0 24px rgba(139,92,246,0.40))",
                animation: "iconPulse 3s ease-in-out infinite",
              }}
            />
            <div className="space-y-1">
              <p
                className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.70)" }}
              >
                Selecciona una conversación
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
                para ver el detalle del chat.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
