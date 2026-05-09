# ARCHITECTURE.md — SafeNotify Panel

Documento de referencia arquitectónica para el panel web de SafeNotify. Todo agente o developer que toque este repo debe leer este archivo antes de crear o modificar archivos. Para contexto de producto ver `PRODUCT.md`; para reglas duras ver `CLAUDE.md`.

Ultima actualización: 2026-05-09

---

## 1. Estructura de carpetas detallada

```
safenotify-panel/
├── .claude/                          # Agentes y skills (no sube a producción, en .gitignore)
├── public/
│   └── fonts/                        # Fuentes locales si se sirven estáticamente
├── src/
│   ├── app/                          # App Router de Next.js 15 (ÚNICO router permitido)
│   │   ├── layout.tsx                # Root layout: configura fuente, html/body, providers globales
│   │   ├── globals.css               # CSS base + variables CSS del tema (light y dark mode)
│   │   ├── (auth)/                   # Grupo de rutas sin autenticación
│   │   │   ├── layout.tsx            # Layout centrado, sin sidebar (página de login)
│   │   │   └── login/
│   │   │       └── page.tsx          # Página de login con email + password
│   │   ├── (dashboard)/              # Grupo de rutas protegidas (requieren sesión)
│   │   │   ├── layout.tsx            # Layout con sidebar fijo 200px + área principal
│   │   │   ├── page.tsx              # Redirect a /conversaciones (ruta default)
│   │   │   ├── conversaciones/
│   │   │   │   ├── page.tsx          # Lista de chats + panel de detalle (layout split)
│   │   │   │   └── [phone]/
│   │   │   │       └── page.tsx      # Detalle de conversación individual (mobile deep link)
│   │   │   ├── pedidos/
│   │   │   │   └── page.tsx          # Tabla de pedidos con filtros y cambio de estado
│   │   │   ├── metricas/
│   │   │   │   └── page.tsx          # Dashboard de métricas del día (tarjetas numéricas)
│   │   │   └── configuracion/
│   │   │       └── page.tsx          # Info del negocio + email + logout
│   │   └── api/                      # Route handlers (reservados para webhooks o integraciones)
│   │       └── .gitkeep              # Carpeta vacía; los handlers se crean aquí cuando aplique
│   │
│   ├── components/
│   │   ├── ui/                       # Componentes generados por shadcn/ui (NO tocar manualmente)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── card.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── form.tsx
│   │   │   └── table.tsx
│   │   └── features/                 # Componentes del dominio SafeNotify
│   │       ├── layout/
│   │       │   ├── Sidebar.tsx           # Sidebar con nav, badge de urgentes, avatar usuario
│   │       │   └── MobileDrawer.tsx      # Sidebar como drawer en móvil (<768px)
│   │       ├── conversations/
│   │       │   ├── ConversationList.tsx      # Lista scrollable de chats_activos
│   │       │   ├── ConversationListItem.tsx  # Un chat en la lista (con estado urgente)
│   │       │   ├── ConversationDetail.tsx    # Panel derecho con historial completo
│   │       │   ├── MessageBubble.tsx         # Burbuja individual (cliente/bot/humano)
│   │       │   ├── PauseControls.tsx         # Botones "Pausar 30 min" y "Tomar control"
│   │       │   └── ManualMessageInput.tsx    # Input para enviar mensaje manual al cliente
│   │       ├── pedidos/
│   │       │   ├── PedidosTable.tsx       # Tabla con columnas definidas en PRODUCT.md
│   │       │   ├── PedidoRow.tsx          # Fila de pedido con dropdown de estado
│   │       │   └── PedidoFilters.tsx      # Filtros por estado (abierto/en_preparacion/etc.)
│   │       └── metricas/
│   │           └── MetricCard.tsx         # Tarjeta de número grande con label
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # createBrowserClient() — para "use client" components
│   │   │   ├── server.ts             # createServerClient() — para Server Components y Actions
│   │   │   ├── middleware.ts         # updateSession() — helper para src/middleware.ts
│   │   │   └── database.types.ts     # Tipos generados con `supabase gen types typescript`
│   │   ├── actions/                  # Server Actions organizadas por dominio
│   │   │   ├── pauseBot.ts           # insert/delete en sesiones_pausadas
│   │   │   ├── sendMessage.ts        # insert en mensajes_salientes_panel
│   │   │   └── updatePedidoEstado.ts # update estado en pedidos
│   │   ├── hooks/                    # Custom hooks para Client Components
│   │   │   ├── useConversationRealtime.ts  # Suscripción Realtime a historial de un chat
│   │   │   └── useChatsRealtime.ts         # Suscripción Realtime para lista de chats_activos
│   │   ├── utils.ts                  # Funciones utilitarias genéricas (formatPhone, etc.)
│   │   └── constants.ts              # PEDIDO_STATES, PAUSE_DURATIONS, colores semánticos
│   │
│   ├── types/
│   │   ├── domain.types.ts           # Tipos del dominio extraídos de database.types.ts
│   │   └── ui.types.ts               # Tipos propios de UI (ej. ChatUrgencyLevel)
│   │
│   └── middleware.ts                 # Middleware Next.js: protege rutas y refresca sesión
│
├── supabase/
│   └── migrations/                   # Migraciones SQL propuestas (NUNCA ejecutar sin aprobación)
│       └── 001_add_auth_user_id.sql  # PENDIENTE DE EJECUTAR — aprobada 2026-05-09
│
├── .env.local                        # Variables de entorno locales (no subir al repo)
├── .env.local.example                # Template de variables (sí sube al repo)
├── .gitignore
├── CLAUDE.md
├── PRODUCT.md
├── ARCHITECTURE.md                   # Este archivo
├── components.json                   # Config de shadcn/ui
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## 2. Dependencias a instalar (versiones exactas)

### Paso 1 — Crear el proyecto con create-next-app

```bash
npx create-next-app@15 safenotify-panel \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

Flags justificados:
- `--app`: App Router obligatorio (hard rule).
- `--src-dir`: convención del proyecto.
- `--import-alias "@/*"`: imports limpios en todo el codebase.
- `--no-turbopack`: Turbopack aún tiene inconsistencias con algunos plugins de Tailwind v4. Usar webpack estable.

### Paso 2 — Supabase SDK

```bash
npm install @supabase/ssr@latest @supabase/supabase-js@latest
```

`@supabase/ssr` reemplaza a `@supabase/auth-helpers-nextjs` y es el paquete oficial para Next.js App Router. Incluye `createBrowserClient` y `createServerClient`.

### Paso 3 — Iconos

```bash
npm install lucide-react@latest
```

### Paso 4 — Dependencias de desarrollo

`create-next-app` ya instala: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss`, `autoprefixer`, `postcss`, `eslint`, `eslint-config-next`.

No hay dependencias adicionales de dev para el scaffolding inicial.

### Paso 5 — shadcn/ui (no es un paquete npm, se inicializa con CLI)

```bash
npx shadcn@latest init
```

Ver sección 6 para opciones del `init` y lista de componentes.

### Resumen de package.json resultante (dependencies relevantes)

```
next@^15.x.x
react@^19.x.x
react-dom@^19.x.x
@supabase/ssr@latest
@supabase/supabase-js@latest
lucide-react@latest
tailwind-merge@latest       (instalado por shadcn init)
class-variance-authority@latest  (instalado por shadcn init)
clsx@latest                 (instalado por shadcn init)
```

No se instala `@tanstack/react-query` ni `next-intl`. Ver decisiones 7.1 y 7.3.

---

## 3. Decisiones de routing

### Grupo `(auth)` — rutas públicas

| Ruta | Archivo | Descripción |
|---|---|---|
| `/login` | `app/(auth)/login/page.tsx` | Formulario email + password, Supabase Auth. Sin registro público. |

Layout `(auth)/layout.tsx`: pantalla centrada, fondo beige cálido (`#FAF8F5`), sin sidebar.

### Grupo `(dashboard)` — rutas protegidas

| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `app/(dashboard)/page.tsx` | Redirect permanente a `/conversaciones`. |
| `/conversaciones` | `app/(dashboard)/conversaciones/page.tsx` | Vista split: lista izquierda + detalle derecho. En móvil, solo la lista. |
| `/conversaciones/[phone]` | `app/(dashboard)/conversaciones/[phone]/page.tsx` | Detalle de un chat específico (usado en navegación móvil). |
| `/pedidos` | `app/(dashboard)/pedidos/page.tsx` | Tabla full-width con filtros. |
| `/metricas` | `app/(dashboard)/metricas/page.tsx` | Grid de tarjetas de métricas del día. |
| `/configuracion` | `app/(dashboard)/configuracion/page.tsx` | Perfil del usuario y datos del negocio en modo lectura. |

Layout `(dashboard)/layout.tsx`: sidebar 200px fijo + área principal. Sidebar colapsable en tablet, drawer en móvil.

### Root layout

`app/layout.tsx` maneja:
- Configuración de fuente (Geist o Inter via `next/font`).
- Provider del Toaster (sonner) para toasts globales.
- Metadata global (`<title>`, `<meta description>`).
- No tiene navbar ni sidebar — eso lo hace `(dashboard)/layout.tsx`.

### Middleware de protección de rutas

`src/middleware.ts` ejecuta en todas las rutas excepto assets estáticos:
- Llama a `updateSession()` de `src/lib/supabase/middleware.ts` para refrescar el token de sesión.
- Si el usuario no tiene sesión y pide una ruta de `(dashboard)`, redirige a `/login`.
- Si el usuario tiene sesión y pide `/login`, redirige a `/conversaciones`.

El matcher del middleware cubre `/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)`.

---

## 4. Pasos ordenados del scaffolding

Ejecutar en este orden exacto. No saltar pasos.

**1. Crear el proyecto Next.js**

```bash
npx create-next-app@15 safenotify-panel \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --no-turbopack
cd safenotify-panel
```

**2. Instalar dependencias de Supabase y Lucide**

```bash
npm install @supabase/ssr@latest @supabase/supabase-js@latest lucide-react@latest
```

**3. Inicializar shadcn/ui**

```bash
npx shadcn@latest init
```

Opciones a elegir en el wizard:
- Style: `new-york`
- Base color: `neutral` (la paleta custom se define en CSS variables, no depende del base color de shadcn)
- CSS variables: `yes`
- Ruta de componentes: `src/components/ui` (confirmar que coincide)

**4. Instalar componentes shadcn/ui base**

```bash
npx shadcn@latest add button input label card sheet dialog dropdown-menu avatar badge separator skeleton sonner form table
```

**5. Crear la estructura de carpetas vacía**

Crear manualmente los directorios que `create-next-app` no genera:
- `src/app/(auth)/login/`
- `src/app/(dashboard)/conversaciones/[phone]/`
- `src/app/(dashboard)/pedidos/`
- `src/app/(dashboard)/metricas/`
- `src/app/(dashboard)/configuracion/`
- `src/app/api/`
- `src/components/features/layout/`
- `src/components/features/conversations/`
- `src/components/features/pedidos/`
- `src/components/features/metricas/`
- `src/lib/supabase/`
- `src/lib/actions/`
- `src/lib/hooks/`
- `src/types/`
- `supabase/migrations/`

**6. Crear `.env.local` con variables de entorno**

Copiar `.env.local.example` y completar con valores reales del proyecto `safenotify-prod`.

**7. Crear los clientes de Supabase**

Crear los tres archivos en `src/lib/supabase/`: `client.ts`, `server.ts`, `middleware.ts`. Ver sección 5.

**8. Generar tipos TypeScript de Supabase**

```bash
npx supabase gen types typescript --project-id <PROJECT_REF> > src/lib/supabase/database.types.ts
```

Reemplazar `<PROJECT_REF>` con el ID del proyecto Supabase (`safenotify-prod`). Se necesita tener instalado el CLI de Supabase y estar autenticado.

**9. Crear el middleware de Next.js**

Crear `src/middleware.ts` con la lógica de protección de rutas (ver sección 5).

**10. Crear los layouts**

- `src/app/layout.tsx` — root layout.
- `src/app/(auth)/layout.tsx` — layout centrado.
- `src/app/(dashboard)/layout.tsx` — layout con sidebar.

**11. Crear páginas placeholder**

Una página por ruta del dashboard con un `<h1>` y el nombre de la sección. Confirmar que el build compila sin errores antes de implementar features.

**12. Configurar CSS variables del tema (light y dark)**

En `src/app/globals.css`, definir las CSS variables con la paleta de colores del `PRODUCT.md` para ambos modos de color. Ver sección 6 para el detalle de variables.

**13. Verificar build local**

```bash
npm run build
npm run start
```

Confirmar que:
- El build compila sin errores de TypeScript.
- `/login` carga sin sesión.
- `/conversaciones` redirige a `/login` sin sesión.
- `/conversaciones` carga (con placeholder) con sesión activa.

---

## 5. Setup de Supabase

### Variables de entorno

**`.env.local.example`** (subir al repo):

```
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

**Reglas:**
- `NEXT_PUBLIC_*` son visibles en el cliente. Usarlas SOLO para URL y anon key (son seguras por RLS).
- `SUPABASE_SERVICE_ROLE_KEY` NUNCA debe llegar al cliente. Usar solo en Server Actions o route handlers cuando RLS no sea suficiente (casos excepcionales).

### `src/lib/supabase/client.ts`

Crea un cliente Supabase para componentes con `"use client"`. Usa `createBrowserClient` de `@supabase/ssr`. Se instancia una sola vez por render (no en module scope para evitar problemas en testing).

```typescript
// Patrón de uso esperado en Client Components:
// const supabase = createClient()
// const { data } = await supabase.from("chats_activos").select(...)
```

### `src/lib/supabase/server.ts`

Crea un cliente Supabase para Server Components y Server Actions. Usa `createServerClient` de `@supabase/ssr` con `cookies()` de `next/headers`. Es `async` porque `cookies()` en Next.js 15 es async.

```typescript
// Patrón de uso esperado en Server Components:
// const supabase = await createClient()
// const { data } = await supabase.from("pedidos").select(...)
```

### `src/lib/supabase/middleware.ts`

Exporta `updateSession(request: NextRequest)` que:
1. Crea un cliente de Supabase con acceso a request y response cookies.
2. Llama a `supabase.auth.getUser()` para refrescar el token JWT si está expirado.
3. Retorna la response modificada con cookies actualizadas.

Este helper es el punto de entrada del middleware de Next.js.

### `src/middleware.ts`

```typescript
// Lógica a implementar:
// 1. Llamar updateSession(request) para refrescar cookies.
// 2. Obtener user de auth.
// 3. Si no hay user y la ruta empieza con /conversaciones, /pedidos, /metricas, /configuracion:
//    -> redirect a /login
// 4. Si hay user y la ruta es /login:
//    -> redirect a /conversaciones
// 5. Retornar la response con cookies actualizadas.
```

### `src/lib/supabase/database.types.ts`

Generado automáticamente. Exporta el tipo `Database` que describe todas las tablas. Los tipos del dominio en `src/types/domain.types.ts` se derivan de aquí:

```typescript
// Ejemplo en domain.types.ts:
import type { Database } from "@/lib/supabase/database.types";

export type Negocio = Database["public"]["Tables"]["negocios"]["Row"];
export type Pedido = Database["public"]["Tables"]["pedidos"]["Row"];
export type Historial = Database["public"]["Tables"]["historial"]["Row"];
export type SesionPausada = Database["public"]["Tables"]["sesiones_pausadas"]["Row"];
export type MensajeSalientePanel = Database["public"]["Tables"]["mensajes_salientes_panel"]["Row"];
export type ChatActivo = Database["public"]["Views"]["chats_activos"]["Row"];
```

### Migración aprobada: `auth_user_id` en `usuarios_panel`

La columna `auth_user_id uuid` fue aprobada por Michael el 2026-05-09. El SQL vive en `supabase/migrations/001_add_auth_user_id.sql`. Esta migración está **pendiente de ejecutar** en Supabase. Ver `CLAUDE.md` sección "Excepciones aprobadas al schema" para contexto.

Una vez ejecutada, el flujo de auth del panel usará `auth.uid()` para hacer JOIN con `usuarios_panel.auth_user_id` y obtener el `negocio_id` del usuario autenticado.

---

## 6. Setup de shadcn/ui

### Comando de inicialización

```bash
npx shadcn@latest init
```

Configuración recomendada:
- **Style:** `new-york` — bordes y radios más definidos que `default`, encaja mejor con el diseño pastel del PRODUCT.md.
- **Base color:** `neutral` — la paleta real la definimos nosotros via CSS variables. Neutral evita que shadcn sobreescriba con un color fuerte.
- **CSS variables:** `yes` — permite personalizar la paleta sin tocar los componentes.

El resultado genera `components.json` y configura `tailwind.config.ts` automáticamente.

### Componentes base a instalar y justificación

| Componente | Justificación |
|---|---|
| `button` | Toda acción del panel: pausar, enviar, cambiar estado. |
| `input` | Formulario de login, input de mensaje manual, búsqueda de chats. |
| `label` | Accesibilidad en todos los formularios. |
| `card` | Tarjetas de métricas, detalle de pedido, wrapper del login. |
| `sheet` | Sidebar drawer en móvil (<768px), reemplaza al sidebar fijo. |
| `dialog` | Confirmación de acciones destructivas (cancelar pedido). |
| `dropdown-menu` | Selector de estado de pedido (abierto/en_preparacion/entregado/cancelado). |
| `avatar` | Foto/inicial de cliente en lista de chats y sidebar. |
| `badge` | Tags de estado en chats (`bot activo`, `bot pausado`, `requiere humano`) y badge de urgentes en sidebar. |
| `separator` | Divisores visuales en sidebar y secciones. |
| `skeleton` | Loading states para lista de chats, tabla de pedidos y métricas. |
| `sonner` | Toasts para feedback de acciones (pausa exitosa, error de envío, etc.). |
| `form` | Formulario de login con react-hook-form + validación. |
| `table` | Tabla de pedidos. |

### Modo oscuro — decisión aprobada (2026-05-09)

Se implementa dark mode desde el scaffolding inicial. El toggle de modo no es prioridad de v1, pero los componentes deben respetar `prefers-color-scheme` del sistema operativo del usuario desde el primer día. Esto se logra con `@media (prefers-color-scheme: dark)` en `globals.css` y las variantes `dark:` de Tailwind.

No se instala ninguna librería de gestión de tema. Si en v2 se agrega un toggle, se usa `next-themes`.

### CSS variables del tema en `globals.css`

`src/app/globals.css` define variables para light y dark mode. Los componentes de shadcn/ui las consumen automáticamente; los componentes custom usan `bg-[var(--color-*)]` o extensiones de Tailwind.

```css
/* Light mode — paleta beige/menta del PRODUCT.md */
:root {
  --sidebar-bg: #E8F0DC;
  --sidebar-text-active: #3B6D11;
  --accent-green: #B8D88A;
  --accent-green-hover: #A5C674;
  --accent-orange: #FAE0B8;
  --accent-red: #F4A8A6;
  --background: #FAF8F5;
  --card-bg: #FFFFFF;
  --foreground: #1A1A1A;
  --muted: #6B7280;
}

/* Dark mode — respeta preferencia del sistema */
@media (prefers-color-scheme: dark) {
  :root {
    --sidebar-bg: #1E2A14;
    --sidebar-text-active: #B8D88A;
    --accent-green: #3B6D11;
    --accent-green-hover: #4A8A16;
    --accent-orange: #7A5A2A;
    --accent-red: #7A2A2A;
    --background: #111210;
    --card-bg: #1C1F1A;
    --foreground: #F0EDE8;
    --muted: #9CA3AF;
  }
}
```

Estas variables se consumen directamente en Tailwind como `bg-[var(--sidebar-bg)]` o definiendo extensiones en `tailwind.config.ts`.

---

## 7. Decisiones aprobadas (2026-05-09)

Las siguientes decisiones fueron revisadas por Michael Ladino y aprobadas con las condiciones indicadas. No reabrir sin razón fuerte.

| # | Tema | Decisión final |
|---|---|---|
| 7.1 | Realtime | Hook custom con Supabase Realtime directo. Sin TanStack Query en v1. Ver detalle abajo. |
| 7.2 | Modo oscuro | Implementar desde el inicio con `prefers-color-scheme`. Toggle NO es prioridad de v1. Ver sección 6. |
| 7.3 | i18n | Strings hardcoded en español. NO instalar `next-intl`. Decisión definitiva. |
| 7.4 | `auth_user_id` en `usuarios_panel` | APROBADO. SQL en `supabase/migrations/001_add_auth_user_id.sql`. Pendiente de ejecutar. |
| 7.5 | `mensajes_salientes_panel` / procesador n8n | El panel hace INSERT normal. Toast dice "Mensaje encolado, se enviará en breve". Ver sección 7.5. |
| 7.6 | `chats_activos` es VIEW (no materializada) | Suscribirse a tablas base + refetch de la vista en cada evento. Ver patrón abajo. |

---

### 7.1 Realtime: hook custom con Supabase Realtime directo

**Decisión:** hook custom en `src/lib/hooks/`. Sin TanStack Query.

**Patrón base:**

```typescript
// src/lib/hooks/useConversationRealtime.ts
// "use client"
// Abre un canal de Supabase Realtime suscrito a historial para un (negocio_id, phone).
// En el callback de INSERT, agrega el mensaje al estado local.
// cleanup: supabase.removeChannel(channel) en el return del useEffect.
```

```typescript
// src/lib/hooks/useChatsRealtime.ts
// "use client"
// Suscripción a historial, sesiones_pausadas y pedidos.
// En cualquier evento, refetch de chats_activos con SELECT.
// Ver patrón "Patrón para vistas: refetch on event" abajo.
```

**Cleanup obligatorio:** cada hook retorna la suscripción en el `useEffect` cleanup para evitar memory leaks y doble-subscripción en React Strict Mode.

**Si el caching se vuelve problemático en v2**, migrar a TanStack Query con `queryClient.invalidateQueries` en el callback del canal.

#### Patrón para vistas: refetch on event

`chats_activos` es una VIEW de Postgres (confirmado decisión 7.6). Supabase Realtime no puede suscribirse directamente a vistas. El patrón aprobado:

1. Abrir canales Realtime en las tablas base: `historial`, `sesiones_pausadas`, `pedidos`.
2. Cuando llega cualquier evento (`INSERT`, `UPDATE`, `DELETE`) en cualquiera de esas tablas para el `negocio_id` del usuario:
   - Ejecutar `supabase.from("chats_activos").select("*").eq("negocio_id", negocioId).order("ultimo_mensaje_at", { ascending: false })`.
   - Actualizar el estado local con el resultado.
3. El fetch inicial de `chats_activos` sigue siendo un Server Component (sin Realtime). El hook de Realtime solo gestiona actualizaciones posteriores.

Este patrón implica un SELECT extra por evento, lo cual es aceptable para el volumen de v1 (un negocio, pocos chats simultáneos).

---

### 7.5 Pendientes externos (fuera del repo del panel)

Esta sección documenta dependencias del panel hacia sistemas externos que aún no existen o no están confirmados.

#### Procesador de `mensajes_salientes_panel`

| Campo | Detalle |
|---|---|
| Qué falta | Un workflow (n8n) o proceso que lea `mensajes_salientes_panel WHERE estado = 'pendiente'`, envíe el mensaje via Twilio y actualice el campo `estado` a `'enviado'` (o `'error'` si falla). |
| Dónde vive | n8n Cloud (mismo workspace del bot de D'Andrés). |
| Quién lo construye | Michael Ladino, como tarea separada fuera de este repo. |
| Estado actual | No existe. La tabla existe en Supabase pero nadie la procesa todavía. |
| Comportamiento del panel mientras tanto | El panel hace INSERT normalmente. El toast al usuario dice literalmente **"Mensaje encolado, se enviará en breve"** — nunca "Mensaje enviado", para no mentirle a Claudia sobre si el mensaje llegó. El mensaje queda en estado `'pendiente'` indefinidamente hasta que el procesador exista. |
| Impacto en v1 | El feature de mensajes manuales no funciona end-to-end hasta que este procesador exista. El UI del panel puede construirse y testearse (el INSERT funciona), pero el mensaje no llega a WhatsApp. |

---

## Apéndice: Tablas que usa el panel y permisos

| Tabla | Lee | Escribe | Qué escribe |
|---|---|---|---|
| `negocios` | Si | No | — |
| `historial` | Si | No | — (read-only, bot es la fuente de verdad) |
| `resumenes` | Si | No | — |
| `pedidos` | Si | Si | Solo `estado` (y opcionalmente `notas`) |
| `interacciones` | Si | No | — |
| `sesiones_pausadas` | Si | Si | Insert para pausar, delete/update para despausar |
| `mensajes_salientes_panel` | Si | Si | Insert de mensajes manuales del operador humano |
| `chats_activos` | Si | No | — (es VIEW de Postgres; Realtime via tablas base) |
| `usuarios_panel` | Si | Pendiente | Depende de ejecución de migración 001 |
