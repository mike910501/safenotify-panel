import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { ConversationDetail } from "@/components/features/conversations/ConversationDetail";
import type { ChatActivo } from "@/types/domain.types";

interface ConversacionDetallePageProps {
  params: Promise<{ phone: string }>;
}

export default async function ConversacionDetallePage({
  params,
}: ConversacionDetallePageProps) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  const { phone } = await params;

  // Obtener info del chat para saber si está pausado.
  const supabase = await createClient();
  let query = supabase
    .from("chats_activos")
    .select("*")
    .eq("phone", phone);

  if (usuario.rol !== "admin") {
    query = query.eq("negocio_id", usuario.negocioId);
  }

  const { data } = await query.maybeSingle();
  const chat = data as ChatActivo | null;

  const negocioId = chat?.negocio_id ?? (usuario.rol !== "admin" ? usuario.negocioId : "");

  return (
    <div className="flex h-full flex-col">
      <ConversationDetail
        phone={phone}
        negocioId={negocioId}
        botPausado={chat?.bot_pausado ?? false}
      />
    </div>
  );
}
