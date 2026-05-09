/**
 * Tipos TypeScript de la base de datos Supabase.
 *
 * Generado manualmente el 2026-05-09 a partir del schema documentado en
 * .claude/skills/supabase-schema/SKILL.md.
 *
 * Para regenerar este archivo cuando el schema cambie:
 *   npx supabase gen types typescript --project-id yxdkkqzckvwqxtewyiiw > src/lib/supabase/database.types.ts
 *
 * O copiar la salida desde el dashboard de Supabase.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      negocios: {
        Row: {
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
        };
        Insert: {
          negocio_id: string;
          nombre_negocio: string;
          tipo_negocio?: string | null;
          tipo_agente?: string | null;
          nombre_bot?: string | null;
          direccion?: string | null;
          horarios?: string | null;
          menu?: string | null;
          metodos_pago?: string | null;
          faqs?: string | null;
          tono?: string | null;
          contacto_humano?: string | null;
          telefono_dueno?: string | null;
          numeros_notificacion?: string | null;
          calendar_id?: string | null;
          twilio_from?: string | null;
          menu_imagen_url?: string | null;
          menu_imagen_url_2?: string | null;
          link_menu?: string | null;
          prompt_sistema?: string | null;
          intenciones_validas?: string | null;
          prompt_fallback?: string | null;
          contexto_negocio?: string | null;
          tiempo_domicilio?: string | null;
          tiempo_para_llevar?: string | null;
          tiempo_local?: string | null;
          aviso_privacidad?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          negocio_id?: string;
          nombre_negocio?: string;
          tipo_negocio?: string | null;
          tipo_agente?: string | null;
          nombre_bot?: string | null;
          direccion?: string | null;
          horarios?: string | null;
          menu?: string | null;
          metodos_pago?: string | null;
          faqs?: string | null;
          tono?: string | null;
          contacto_humano?: string | null;
          telefono_dueno?: string | null;
          numeros_notificacion?: string | null;
          calendar_id?: string | null;
          twilio_from?: string | null;
          menu_imagen_url?: string | null;
          menu_imagen_url_2?: string | null;
          link_menu?: string | null;
          prompt_sistema?: string | null;
          intenciones_validas?: string | null;
          prompt_fallback?: string | null;
          contexto_negocio?: string | null;
          tiempo_domicilio?: string | null;
          tiempo_para_llevar?: string | null;
          tiempo_local?: string | null;
          aviso_privacidad?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      historial: {
        Row: {
          id: number;
          negocio_id: string;
          phone: string;
          role: string;
          content: string;
          enviado_por: string;
          timestamp: string;
        };
        Insert: {
          id?: number;
          negocio_id: string;
          phone: string;
          role: string;
          content: string;
          enviado_por?: string;
          timestamp?: string;
        };
        Update: {
          id?: number;
          negocio_id?: string;
          phone?: string;
          role?: string;
          content?: string;
          enviado_por?: string;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: "historial_negocio_id_fkey";
            columns: ["negocio_id"];
            isOneToOne: false;
            referencedRelation: "negocios";
            referencedColumns: ["negocio_id"];
          }
        ];
      };
      resumenes: {
        Row: {
          id: string;
          negocio_id: string;
          phone: string;
          resumen: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          negocio_id: string;
          phone: string;
          resumen: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          negocio_id?: string;
          phone?: string;
          resumen?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resumenes_negocio_id_fkey";
            columns: ["negocio_id"];
            isOneToOne: false;
            referencedRelation: "negocios";
            referencedColumns: ["negocio_id"];
          }
        ];
      };
      pedidos: {
        Row: {
          id: string;
          pedido_id: string;
          pedido_corto: number;
          negocio_id: string;
          phone: string;
          nombre_cliente: string | null;
          items: string | null;
          total: number | null;
          metodo_pago: string | null;
          direccion_entrega: string | null;
          notas: string | null;
          estado: string;
          historial_modificaciones: Json | null;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          pedido_corto: number;
          negocio_id: string;
          phone: string;
          nombre_cliente?: string | null;
          items?: string | null;
          total?: number | null;
          metodo_pago?: string | null;
          direccion_entrega?: string | null;
          notas?: string | null;
          estado?: string;
          historial_modificaciones?: Json | null;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          pedido_corto?: number;
          negocio_id?: string;
          phone?: string;
          nombre_cliente?: string | null;
          items?: string | null;
          total?: number | null;
          metodo_pago?: string | null;
          direccion_entrega?: string | null;
          notas?: string | null;
          estado?: string;
          historial_modificaciones?: Json | null;
          creado_en?: string;
          actualizado_en?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pedidos_negocio_id_fkey";
            columns: ["negocio_id"];
            isOneToOne: false;
            referencedRelation: "negocios";
            referencedColumns: ["negocio_id"];
          }
        ];
      };
      interacciones: {
        Row: {
          id: string;
          negocio_id: string;
          tipo: string;
          phone: string;
          nombre_cliente: string | null;
          items: string | null;
          total: number | null;
          fecha: string | null;
          hora: string | null;
          personas: number | null;
          direccion_entrega: string | null;
          metodo_pago: string | null;
          notas: string | null;
          estado: string | null;
          notificado: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          negocio_id: string;
          tipo: string;
          phone: string;
          nombre_cliente?: string | null;
          items?: string | null;
          total?: number | null;
          fecha?: string | null;
          hora?: string | null;
          personas?: number | null;
          direccion_entrega?: string | null;
          metodo_pago?: string | null;
          notas?: string | null;
          estado?: string | null;
          notificado?: string | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          negocio_id?: string;
          tipo?: string;
          phone?: string;
          nombre_cliente?: string | null;
          items?: string | null;
          total?: number | null;
          fecha?: string | null;
          hora?: string | null;
          personas?: number | null;
          direccion_entrega?: string | null;
          metodo_pago?: string | null;
          notas?: string | null;
          estado?: string | null;
          notificado?: string | null;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interacciones_negocio_id_fkey";
            columns: ["negocio_id"];
            isOneToOne: false;
            referencedRelation: "negocios";
            referencedColumns: ["negocio_id"];
          }
        ];
      };
      sesiones_pausadas: {
        Row: {
          id: string;
          negocio_id: string;
          phone: string;
          pausado_hasta: string;
          pausado_por: string | null;
          motivo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          negocio_id: string;
          phone: string;
          pausado_hasta: string;
          pausado_por?: string | null;
          motivo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          negocio_id?: string;
          phone?: string;
          pausado_hasta?: string;
          pausado_por?: string | null;
          motivo?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sesiones_pausadas_negocio_id_fkey";
            columns: ["negocio_id"];
            isOneToOne: false;
            referencedRelation: "negocios";
            referencedColumns: ["negocio_id"];
          }
        ];
      };
      mensajes_salientes_panel: {
        Row: {
          id: string;
          negocio_id: string;
          phone_destino: string;
          mensaje: string;
          enviado_por: string;
          twilio_sid: string | null;
          estado: string;
          error_mensaje: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          negocio_id: string;
          phone_destino: string;
          mensaje: string;
          enviado_por: string;
          twilio_sid?: string | null;
          estado?: string;
          error_mensaje?: string | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          negocio_id?: string;
          phone_destino?: string;
          mensaje?: string;
          enviado_por?: string;
          twilio_sid?: string | null;
          estado?: string;
          error_mensaje?: string | null;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mensajes_salientes_panel_negocio_id_fkey";
            columns: ["negocio_id"];
            isOneToOne: false;
            referencedRelation: "negocios";
            referencedColumns: ["negocio_id"];
          }
        ];
      };
      usuarios_panel: {
        Row: {
          id: string;
          clerk_user_id: string | null;
          email: string;
          nombre: string | null;
          negocio_id: string;
          rol: "owner" | "operator" | "admin";
          activo: boolean;
          ultimo_login: string | null;
          created_at: string;
          /** Columna agregada por migración 001. Vincula con auth.users.id. */
          auth_user_id: string | null;
        };
        Insert: {
          id?: string;
          clerk_user_id?: string | null;
          email: string;
          nombre?: string | null;
          negocio_id: string;
          rol?: "owner" | "operator" | "admin";
          activo?: boolean;
          ultimo_login?: string | null;
          created_at?: string;
          auth_user_id?: string | null;
        };
        Update: {
          id?: string;
          clerk_user_id?: string | null;
          email?: string;
          nombre?: string | null;
          negocio_id?: string;
          rol?: "owner" | "operator" | "admin";
          activo?: boolean;
          ultimo_login?: string | null;
          created_at?: string;
          auth_user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "usuarios_panel_negocio_id_fkey";
            columns: ["negocio_id"];
            isOneToOne: false;
            referencedRelation: "negocios";
            referencedColumns: ["negocio_id"];
          }
        ];
      };
    };
    Views: {
      chats_activos: {
        Row: {
          negocio_id: string | null;
          phone: string | null;
          ultimo_mensaje_at: string | null;
          ultimo_mensaje: string | null;
          ultimo_role: string | null;
          bot_pausado: boolean | null;
          mensajes_24h: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      /**
       * Genera el siguiente pedido_corto correlativo para un negocio.
       * Probablemente usado por el bot de n8n al crear pedidos nuevos.
       * El panel NO debería invocarla (el panel no crea pedidos).
       */
      siguiente_pedido_corto: {
        Args: { p_negocio_id: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

/**
 * Helpers de tipos para uso conveniente en el panel.
 * Importar así:
 *   import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
 *   type Pedido = Tables<"pedidos">;
 */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];
