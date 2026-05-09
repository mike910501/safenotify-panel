// Domain types derived from Database types.
// Once database.types.ts is generated, replace these placeholders with proper derivations:
// export type Negocio = Database["public"]["Tables"]["negocios"]["Row"];
// etc.

// Placeholder types based on the Supabase schema (supabase-schema SKILL).
// TODO: replace with generated types after running `supabase gen types typescript`.

export interface Negocio {
  negocio_id: string;
  nombre_negocio: string;
  tipo_negocio: string | null;
  tipo_agente: string | null;
  nombre_bot: string | null;
  direccion: string | null;
  horarios: string | null;
  menu: string | null;
  metodos_pago: string | null;
  faqs: string | null;
  tono: string | null;
  contacto_humano: string | null;
  telefono_dueno: string | null;
  numeros_notificacion: string | null;
  calendar_id: string | null;
  twilio_from: string | null;
  menu_imagen_url: string | null;
  menu_imagen_url_2: string | null;
  link_menu: string | null;
  prompt_sistema: string | null;
  intenciones_validas: string | null;
  prompt_fallback: string | null;
  contexto_negocio: string | null;
  tiempo_domicilio: string | null;
  tiempo_para_llevar: string | null;
  tiempo_local: string | null;
  aviso_privacidad: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Historial {
  id: number;
  negocio_id: string;
  phone: string;
  role: "user" | "assistant";
  content: string;
  enviado_por: "cliente" | "bot" | "humano";
  timestamp: string;
}

export interface Pedido {
  id: string;
  pedido_id: string;
  pedido_corto: number;
  negocio_id: string;
  phone: string;
  nombre_cliente: string | null;
  items: string | null;
  total: number;
  metodo_pago: string | null;
  direccion_entrega: string | null;
  notas: string | null;
  estado: string;
  historial_modificaciones: unknown[];
  creado_en: string;
  actualizado_en: string;
}

export interface SesionPausada {
  id: string;
  negocio_id: string;
  phone: string;
  pausado_hasta: string;
  pausado_por: string | null;
  motivo: string | null;
  created_at: string;
}

export interface MensajeSalientePanel {
  id: string;
  negocio_id: string;
  phone_destino: string;
  mensaje: string;
  enviado_por: string;
  twilio_sid: string | null;
  estado: "pendiente" | "enviado" | "error";
  error_mensaje: string | null;
  timestamp: string;
}

export interface ChatActivo {
  negocio_id: string | null;
  phone: string | null;
  ultimo_mensaje_at: string | null;
  ultimo_mensaje: string | null;
  ultimo_role: string | null;
  bot_pausado: boolean | null;
  mensajes_24h: number | null;
}

export interface UsuarioPanel {
  id: string;
  clerk_user_id: string | null;
  email: string;
  nombre: string | null;
}
