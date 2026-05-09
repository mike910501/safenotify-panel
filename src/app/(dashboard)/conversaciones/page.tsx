import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";

export default async function ConversacionesPage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium">Conversaciones</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bienvenido, {usuario.nombre ?? usuario.email}
      </p>
      {/* TODO: implementar lista de chats + panel de detalle */}
    </div>
  );
}
