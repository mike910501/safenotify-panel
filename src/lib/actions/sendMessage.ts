"use server";

// TODO: implementar en feat/mensajes-manuales
// insert en mensajes_salientes_panel
// El toast al usuario debe decir "Mensaje encolado, se enviará en breve"
// (nunca "Mensaje enviado" — el procesador n8n no existe todavía)

export async function sendMessage(
  _negocioId: string,
  _phoneDestino: string,
  _mensaje: string,
  _enviadoPor: string
): Promise<{ error: string | null }> {
  return { error: "No implementado aún" };
}
