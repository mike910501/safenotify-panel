import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { PedidosTable } from "@/components/features/pedidos/PedidosTable";
import type { Tables } from "@/lib/supabase/database.types";

type Pedido = Tables<"pedidos">;

export default async function PedidosPage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  const supabase = await createClient();

  let query = supabase
    .from("pedidos")
    .select("*")
    .order("creado_en", { ascending: false })
    .limit(100);

  if (usuario.rol !== "admin") {
    query = query.eq("negocio_id", usuario.negocioId);
  }

  const { data: pedidos } = await query;

  const initialPedidos: Pedido[] = pedidos ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div
        className="shrink-0 px-6 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <h1
          className="text-2xl font-semibold"
          style={{
            background: "linear-gradient(to right, #FFFFFF, rgba(255,255,255,0.70))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Pedidos
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "rgba(255,255,255,0.50)" }}>
          {usuario.nombreNegocio} · {initialPedidos.length} pedidos cargados
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <PedidosTable
          initialPedidos={initialPedidos}
          negocioId={usuario.negocioId}
          rol={usuario.rol}
        />
      </div>
    </div>
  );
}
