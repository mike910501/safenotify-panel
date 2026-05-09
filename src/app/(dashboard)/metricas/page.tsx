import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";

export default async function MetricasPage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium">Métricas</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bienvenido, {usuario.nombre ?? usuario.email}
      </p>
      {/* TODO: implementar tarjetas de métricas del día */}
    </div>
  );
}
