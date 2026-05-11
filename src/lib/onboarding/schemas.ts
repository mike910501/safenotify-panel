import { z } from "zod";

export const BUSINESS_TYPES = [
  "restaurante",
  "comidas_rapidas",
  "panaderia",
  "cafeteria",
  "bar_pub",
  "otro",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  restaurante: "Restaurante",
  comidas_rapidas: "Comidas rápidas",
  panaderia: "Panadería",
  cafeteria: "Cafetería",
  bar_pub: "Bar / Pub",
  otro: "Otro",
};

export const DAYS_OF_WEEK = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

export const PAYMENT_METHODS = [
  "efectivo",
  "nequi",
  "daviplata",
  "bancolombia_transferencia",
  "tarjeta",
  "otro",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  nequi: "Nequi",
  daviplata: "Daviplata",
  bancolombia_transferencia: "Transferencia Bancolombia",
  tarjeta: "Tarjeta (datafono)",
  otro: "Otro",
};

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const COLOMBIA_MOBILE_PATTERN = /^\+57[3]\d{9}$/;

export const step1Schema = z.object({
  businessName: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre es muy largo"),
  businessType: z.enum(BUSINESS_TYPES, {
    message: "Selecciona un tipo de negocio",
  }),
  address: z
    .string()
    .trim()
    .min(5, "Escribe la dirección completa")
    .max(200, "La dirección es muy larga"),
  city: z
    .string()
    .trim()
    .min(2, "Escribe el nombre de tu ciudad")
    .max(80, "El nombre de ciudad es muy largo"),
});

const dayHoursSchema = z
  .object({
    closed: z.boolean(),
    openTime: z.string().regex(TIME_PATTERN, "Hora inválida").optional(),
    closeTime: z.string().regex(TIME_PATTERN, "Hora inválida").optional(),
  })
  .refine(
    (day) => {
      if (day.closed) return true;
      return Boolean(day.openTime) && Boolean(day.closeTime);
    },
    { message: "Indica hora de apertura y cierre" }
  )
  .refine(
    (day) => {
      if (day.closed || !day.openTime || !day.closeTime) return true;
      return day.openTime < day.closeTime;
    },
    { message: "La apertura debe ser antes del cierre" }
  );

export const step2Schema = z.object({
  schedule: z.object({
    lunes: dayHoursSchema,
    martes: dayHoursSchema,
    miercoles: dayHoursSchema,
    jueves: dayHoursSchema,
    viernes: dayHoursSchema,
    sabado: dayHoursSchema,
    domingo: dayHoursSchema,
  }),
});

export const step3Schema = z
  .object({
    menuText: z.string().trim().max(5000, "El menú es muy largo"),
    menuImageUrl: z
      .string()
      .url("URL de imagen inválida")
      .or(z.literal("")),
  })
  .refine(
    (data) =>
      (data.menuText && data.menuText.length > 0) ||
      (data.menuImageUrl && data.menuImageUrl.length > 0),
    {
      message: "Sube una imagen del menú o escríbelo en texto",
      path: ["menuText"],
    }
  );

export const step4Schema = z.object({
  methods: z
    .array(z.enum(PAYMENT_METHODS))
    .min(1, "Selecciona al menos un método de pago"),
});

export const step5Schema = z
  .object({
    email: z.string().trim().toLowerCase().email("Email inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
    ownerWhatsapp: z
      .string()
      .trim()
      .regex(
        COLOMBIA_MOBILE_PATTERN,
        "Formato esperado: +57 seguido de celular (ej. +573001234567)"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const onboardingPayloadSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  step5: step5Schema,
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type DayHours = z.infer<typeof dayHoursSchema>;
export type WeekSchedule = Step2Data["schedule"];
export type OnboardingPayload = z.infer<typeof onboardingPayloadSchema>;
