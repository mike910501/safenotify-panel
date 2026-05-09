import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

const ROL_LABELS: Record<string, string> = {
  owner: "Propietario",
  operator: "Operador",
  admin: "Administrador",
};

export default async function ConfiguracionPage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  const ultimoLoginFormateado = usuario.ultimoLogin
    ? new Date(usuario.ultimoLogin).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Primera vez";

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-xl font-medium mb-5">Configuración</h1>

      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-sm font-medium">Tu cuenta</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow label="Correo electrónico" value={usuario.email} />
          <InfoRow label="Nombre" value={usuario.nombre ?? "—"} />
          <InfoRow label="Rol" value={ROL_LABELS[usuario.rol] ?? usuario.rol} />
          <InfoRow label="Negocio" value={usuario.nombreNegocio} />
          <InfoRow label="Ultimo acceso" value={ultimoLoginFormateado} />
        </CardContent>
      </Card>
    </div>
  );
}
