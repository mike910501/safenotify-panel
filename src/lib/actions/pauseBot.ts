"use server";

// TODO: implementar en feat/pausar-bot
// insert en sesiones_pausadas para pausar el bot para un (negocio_id, phone)
// delete de sesiones_pausadas activas para despausar

export async function pauseBot(
  _negocioId: string,
  _phone: string,
  _minutesDuration: number,
  _pausadoPor: string
): Promise<{ error: string | null }> {
  return { error: "No implementado aún" };
}

export async function unpauseBot(
  _negocioId: string,
  _phone: string
): Promise<{ error: string | null }> {
  return { error: "No implementado aún" };
}
