# SafeNotify Panel

Panel web administrativo para SafeNotify SAS — plataforma de automatización WhatsApp para restaurantes en Colombia.

## Contexto del producto

SafeNotify es un servicio SaaS que automatiza la atención por WhatsApp para restaurantes. Cliente actual en producción: **D'Andrés Comidas Rápidas** (Barrancabermeja, dueña Claudia Beltrán). El bot recibe pedidos, responde dudas, agenda reservas y notifica al dueño cuando entra un pedido.

## Arquitectura general del ecosistema SafeNotify

WhatsApp (Twilio) -> n8n Cloud (workflow del bot) -> Supabase (datos)
                                                  -> DeepSeek API (respuestas IA)
                                                  -> Google Calendar (reservas)

[Este proyecto] Panel web -> Supabase (lectura/escritura)

El **panel web** (este repo) es la interfaz humana sobre el ecosistema:
- Permite a Claudia (y futuros clientes) ver conversaciones en vivo.
- Pausar el bot y tomar control manual de un chat.
- Ver pedidos y cambiar estados.
- Ver métricas básicas.

## Stack del panel

- **Framework:** Next.js 15 (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth + Postgres + Realtime)
- **Hosting:** Render (dominio ya existe)
- **TypeScript:** estricto

## Reglas duras (hard rules)

1. NO modificar el schema de Supabase sin aprobación explícita. El bot de n8n depende de la estructura actual. Cualquier ALTER TABLE rompe producción.
2. NO escribir en tablas que el bot escribe (historial, pedidos, interacciones) salvo sesiones_pausadas y casos explícitamente aprobados.
3. TypeScript estricto: any está prohibido salvo justificación documentada.
4. No usar Pages Router de Next.js. Solo App Router.
5. No romper el dominio en producción. Cualquier deploy nuevo es a un servicio paralelo en Render hasta validación.

## Excepciones aprobadas al schema

Las siguientes migraciones fueron aprobadas explícitamente por Michael Ladino y están documentadas como excepciones a la regla dura #1.

| Archivo | Fecha de aprobación | Razón | Estado | Afecta al bot |
|---|---|---|---|---|
| `supabase/migrations/001_add_auth_user_id.sql` | 2026-05-09 | Vincular `usuarios_panel` con `auth.users` de Supabase Auth para que el panel pueda autenticar y autorizar acceso por negocio. La columna es NULLABLE. | Ejecutada el 2026-05-09 | No. El bot de n8n no consulta `usuarios_panel`. |

**Instrucciones para ejecutar una migración aprobada:** ir al SQL Editor de Supabase (proyecto `safenotify-prod`), pegar el contenido del archivo de migración, revisar una vez más y ejecutar. Cambiar el estado en esta tabla a "Ejecutada" con la fecha.

## Stakeholders

- **Michael Ladino** (dueño del producto, único developer): mikehuertas91@gmail.com
- **Claudia Beltrán** (primera cliente, D'Andrés Comidas Rápidas): usuaria final del panel.

## Estado actual del proyecto

- Bot n8n: producción estable, v6.0 en Supabase.
- Schema Supabase: 8 tablas (negocios, historial, resumenes, pedidos, interacciones, sesiones_pausadas, etc.).
- Panel web: este repo, fase de scaffolding.
