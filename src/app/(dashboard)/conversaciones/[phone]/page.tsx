interface ConversacionDetallePageProps {
  params: Promise<{ phone: string }>;
}

export default async function ConversacionDetallePage({
  params,
}: ConversacionDetallePageProps) {
  const { phone } = await params;

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium">Conversacion: {phone}</h1>
      {/* TODO: implementar detalle de conversación para móvil */}
    </div>
  );
}
