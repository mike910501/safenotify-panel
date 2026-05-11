import {
  BUSINESS_TYPE_LABELS,
  DAYS_OF_WEEK,
  DAY_OF_WEEK_LABELS,
  PAYMENT_METHOD_LABELS,
  type BusinessType,
  type OnboardingPayload,
  type WeekSchedule,
} from "@/lib/onboarding/schemas";

const ROLE_BY_TYPE: Record<BusinessType, string> = {
  restaurante:
    "Atiendes pedidos para llevar y a domicilio, respondes el menú y resuelves dudas sobre tiempos de entrega.",
  comidas_rapidas:
    "Atiendes pedidos rápidos para llevar y a domicilio, confirmas combos y resuelves dudas sobre tiempos.",
  panaderia:
    "Atiendes pedidos de panadería para recoger o domicilio, informas sobre productos del día y horarios.",
  cafeteria:
    "Atiendes pedidos de cafetería y resuelves dudas sobre disponibilidad de bebidas y productos.",
  bar_pub:
    "Atiendes reservas y consultas, confirmas horarios, eventos y disponibilidad.",
  otro:
    "Atiendes consultas de clientes, confirmas información del negocio y canalizas pedidos cuando aplique.",
};

export function formatScheduleAsText(schedule: WeekSchedule): string {
  return DAYS_OF_WEEK.map((day) => {
    const dayData = schedule[day];
    const label = DAY_OF_WEEK_LABELS[day];
    if (dayData.closed) {
      return `- ${label}: cerrado`;
    }
    return `- ${label}: ${dayData.openTime} a ${dayData.closeTime}`;
  }).join("\n");
}

export function buildPromptFromTemplate(data: OnboardingPayload): string {
  const { step1, step2, step3, step4 } = data;
  const role = ROLE_BY_TYPE[step1.businessType];
  const horariosTexto = formatScheduleAsText(step2.schedule);
  const metodosPagoTexto = step4.methods
    .map((method) => PAYMENT_METHOD_LABELS[method])
    .join(", ");

  const menuSection = step3.menuText?.trim()
    ? `Menú:\n${step3.menuText.trim()}`
    : step3.menuImageUrl
    ? `Menú: el cliente puede consultarlo en ${step3.menuImageUrl}`
    : "Menú: pendiente de cargar.";

  return [
    `Eres el asistente virtual de ${step1.businessName}, un negocio de tipo ${BUSINESS_TYPE_LABELS[step1.businessType]} ubicado en ${step1.address}, ${step1.city}.`,
    "",
    role,
    "",
    "Horarios de atención:",
    horariosTexto,
    "",
    menuSection,
    "",
    `Métodos de pago aceptados: ${metodosPagoTexto}.`,
    "",
    "Reglas de comportamiento:",
    "- Saluda con calidez pero ve al grano.",
    "- Si el cliente quiere ordenar, confirma productos, dirección y método de pago antes de cerrar el pedido.",
    "- Si el cliente pregunta algo que no sabes, ofrece pasar la conversación a una persona del negocio.",
    "- Mantén respuestas cortas y claras, sin parrafadas.",
    "- Habla en español colombiano natural.",
  ].join("\n");
}
