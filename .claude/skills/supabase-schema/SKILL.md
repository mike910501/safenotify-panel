---
name: supabase-schema
description: Schema completo y exacto de la base de datos Supabase de SafeNotify (proyecto safenotify-prod). Cárgala SIEMPRE que vayas a leer, escribir, consultar o crear tipos para cualquier tabla. Incluye columnas, tipos, defaults, relaciones FK y reglas de qué tabla puede tocar el panel vs cuáles son del bot.
---

# Schema de Supabase — SafeNotify Panel

Proyecto Supabase: **safenotify-prod**
Schema: `public`
Convención: nombres en español, snake_case, IDs de tipo `text` (no UUID) cuando son legibles para humanos.

## Reglas críticas de escritura desde el panel

| Tabla | ¿Quién la escribe? | El panel puede... |
|---|---|---|
| `negocios` | Admin (manual) | LEER. Editar config solo con aprobación. |
| `historial` | Bot n8n | **SOLO LEER.** El bot es la fuente de verdad. |
| `resumenes` | Bot n8n | **SOLO LEER.** |
| `pedidos` | Bot n8n | LEER. Update de `estado` permitido (cambiar a `entregado`, etc.). NO insertar. |
| `interacciones` | Bot n8n | LEER. NO escribir. |
| `sesiones_pausadas` | Panel + Bot | **LEER y ESCRIBIR.** Esta es la vía oficial para que el panel pause el bot. |
| `mensajes_salientes_panel` | Panel | **LEER y ESCRIBIR.** Cola de mensajes que el panel encola para enviar vía Twilio. |
| `chats_activos` | Vista derivada | SOLO LEER. Es vista o tabla materializada con resumen de conversaciones. |
| `usuarios_panel` | Panel | LEER y ESCRIBIR (auth). |

## Tablas

### `negocios`
Configuración de cada cliente de SafeNotify. Una fila por cliente.

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `negocio_id` | text | NO | - |
| `nombre_negocio` | text | NO | - |
| `tipo_negocio` | text | YES | null |
| `tipo_agente` | text | YES | `'atencion'` |
| `nombre_bot` | text | YES | `'Asistente'` |
| `direccion` | text | YES | null |
| `horarios` | text | YES | null |
| `menu` | text | YES | null |
| `metodos_pago` | text | YES | null |
| `faqs` | text | YES | null |
| `tono` | text | YES | `'Amable y profesional.'` |
| `contacto_humano` | text | YES | null |
| `telefono_dueno` | text | YES | null |
| `numeros_notificacion` | text | YES | null |
| `calendar_id` | text | YES | `'primary'` |
| `twilio_from` | text | YES | null |
| `menu_imagen_url` | text | YES | null |
| `menu_imagen_url_2` | text | YES | null |
| `link_menu` | text | YES | null |
| `prompt_sistema` | text | YES | null |
| `intenciones_validas` | text | YES | null |
| `prompt_fallback` | text | YES | null |
| `contexto_negocio` | text | YES | null |
| `tiempo_domicilio` | text | YES | null |
| `tiempo_para_llevar` | text | YES | null |
| `tiempo_local` | text | YES | null |
| `aviso_privacidad` | text | YES | null |
| `activo` | boolean | NO | `true` |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |

**PK:** `negocio_id` (es text legible, ej. "dandres", no UUID)
**Lectura típica desde panel:** `SELECT * FROM negocios WHERE activo = true ORDER BY nombre_negocio`

### `historial`
Cada mensaje individual entre cliente y bot. Append-only.

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | bigint | NO | `nextval('historial_id_seq')` |
| `negocio_id` | text | NO | - |
| `phone` | text | NO | - |
| `role` | text | NO | - (valores: `'user'`, `'assistant'`) |
| `content` | text | NO | - |
| `enviado_por` | text | NO | `'bot'` (valores observados: `'cliente'`, `'bot'`, posibles: `'humano'`) |
| `timestamp` | timestamptz | NO | `now()` |

**FK:** `negocio_id → negocios.negocio_id`
**Índices recomendados:** `(negocio_id, phone, timestamp)` para listar conversaciones rápido.
**ATENCIÓN:** El panel NO escribe aquí. Para enviar mensajes desde el panel, usar `mensajes_salientes_panel`.

### `pedidos`
Pedidos confirmados. El bot los crea, el panel puede actualizarles el `estado`.

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` |
| `pedido_id` | text | NO | - (formato: `'PED-XXX'`) |
| `pedido_corto` | integer | NO | - (correlativo dentro del negocio) |
| `negocio_id` | text | NO | - |
| `phone` | text | NO | - |
| `nombre_cliente` | text | YES | null |
| `items` | text | YES | null |
| `total` | numeric | YES | `0` |
| `metodo_pago` | text | YES | null |
| `direccion_entrega` | text | YES | null |
| `notas` | text | YES | null |
| `estado` | text | NO | `'abierto'` |
| `historial_modificaciones` | jsonb | YES | `'[]'::jsonb` |
| `creado_en` | timestamptz | NO | `now()` |
| `actualizado_en` | timestamptz | NO | `now()` |

**FK:** `negocio_id → negocios.negocio_id`
**Estados conocidos:** `'abierto'`, `'entregado'`, posibles: `'cancelado'`, `'en_preparacion'`. Confirmar lista exacta antes de hacer enums.
**Update permitido desde panel:** solo `estado` y opcionalmente `notas`. NO tocar `items`, `total`, `pedido_id`, `pedido_corto`.

### `interacciones`
Eventos programados (recordatorios, seguimientos) que el bot dispara. Solo lectura desde panel.

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` |
| `negocio_id` | text | NO | - |
| `tipo` | text | NO | - |
| `phone` | text | NO | - |
| `nombre_cliente` | text | YES | null |
| `items` | text | YES | null |
| `total` | numeric | YES | `0` |
| `fecha` | date | YES | null |
| `hora` | text | YES | null |
| `personas` | integer | YES | null |
| `direccion_entrega` | text | YES | null |
| `metodo_pago` | text | YES | null |
| `notas` | text | YES | null |
| `estado` | text | YES | `'nuevo'` |
| `notificado` | text | YES | `'no'` |
| `timestamp` | timestamptz | NO | `now()` |

**FK:** `negocio_id → negocios.negocio_id`

### `resumenes`
Resúmenes de conversación generados por Claude Haiku. Una fila por (negocio_id, phone).

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` |
| `negocio_id` | text | NO | - |
| `phone` | text | NO | - |
| `resumen` | text | NO | - |
| `updated_at` | timestamptz | NO | `now()` |

**FK:** `negocio_id → negocios.negocio_id`
**Uso panel:** mostrar al humano el contexto rápido cuando entra a un chat.

### `sesiones_pausadas`
**Tabla clave para el panel.** Insertar aquí pausa el bot para ese (negocio_id, phone) hasta `pausado_hasta`.

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` |
| `negocio_id` | text | NO | - |
| `phone` | text | NO | - |
| `pausado_hasta` | timestamptz | NO | - |
| `pausado_por` | text | YES | null (email del usuario del panel que pausó) |
| `motivo` | text | YES | null |
| `created_at` | timestamptz | NO | `now()` |

**FK:** `negocio_id → negocios.negocio_id`
**Insert típico desde panel:**
```sql
INSERT INTO sesiones_pausadas (negocio_id, phone, pausado_hasta, pausado_por, motivo)
VALUES ('dandres', '573001234567', NOW() + INTERVAL '30 minutes', 'admin@safenotify.com', 'Cliente pidió hablar con humano');
```
**Despausar:** insertar nueva fila con `pausado_hasta` en el pasado, o eliminar las activas.

### `mensajes_salientes_panel`
Cola de mensajes que el panel quiere enviar al cliente vía Twilio. Algún proceso (n8n cron o edge function) los procesa.

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` |
| `negocio_id` | text | NO | - |
| `phone_destino` | text | NO | - |
| `mensaje` | text | NO | - |
| `enviado_por` | text | NO | - (email del usuario del panel) |
| `twilio_sid` | text | YES | null (se llena cuando se envía) |
| `estado` | text | NO | `'pendiente'` (valores: `'pendiente'`, `'enviado'`, `'error'`) |
| `error_mensaje` | text | YES | null |
| `timestamp` | timestamptz | NO | `now()` |

**FK:** `negocio_id → negocios.negocio_id`
**Insert típico desde panel:**
```sql
INSERT INTO mensajes_salientes_panel (negocio_id, phone_destino, mensaje, enviado_por)
VALUES ('dandres', '573001234567', 'Hola, soy Claudia. ¿Te puedo ayudar?', 'admin@safenotify.com');
```

### `chats_activos`
Vista derivada con resumen de chats activos. Solo lectura.

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `negocio_id` | text | YES | null |
| `phone` | text | YES | null |
| `ultimo_mensaje_at` | timestamptz | YES | null |
| `ultimo_mensaje` | text | YES | null |
| `ultimo_role` | text | YES | null |
| `bot_pausado` | boolean | YES | null |
| `mensajes_24h` | bigint | YES | null |

**Uso panel:** lista principal de conversaciones (ordenar por `ultimo_mensaje_at DESC`).

### `usuarios_panel`
Usuarios autenticados del panel.

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` |
| `clerk_user_id` | text | YES | null |
| `email` | text | NO | - |
| `nombre` | text | YES | null |

**Nota:** la presencia de `clerk_user_id` indica que originalmente se pensó usar Clerk como proveedor de auth. Si migramos a Supabase Auth, esta columna queda como legacy y se agrega `auth_user_id uuid` que apunta a `auth.users.id`.

## Relaciones (Foreign Keys)

```
negocios.negocio_id (PK)
   ├── historial.negocio_id
   ├── interacciones.negocio_id
   ├── mensajes_salientes_panel.negocio_id
   ├── pedidos.negocio_id
   ├── resumenes.negocio_id
   ├── sesiones_pausadas.negocio_id
   └── usuarios_panel.negocio_id  (probable, confirmar)
```

Toda tabla operacional tiene FK a `negocios.negocio_id`. Esto es la base del modelo multi-tenant.

## Patrones de query comunes desde el panel

### Listar conversaciones activas de un negocio (ordenadas)
```sql
SELECT *
FROM chats_activos
WHERE negocio_id = $1
ORDER BY ultimo_mensaje_at DESC;
```

### Cargar conversación completa con un cliente
```sql
SELECT id, role, content, enviado_por, timestamp
FROM historial
WHERE negocio_id = $1 AND phone = $2
ORDER BY timestamp ASC;
```

### Verificar si el bot está pausado para un cliente
```sql
SELECT pausado_hasta, motivo, pausado_por
FROM sesiones_pausadas
WHERE negocio_id = $1 AND phone = $2 AND pausado_hasta > NOW()
ORDER BY pausado_hasta DESC
LIMIT 1;
```

### Listar pedidos abiertos
```sql
SELECT pedido_id, pedido_corto, nombre_cliente, items, total, estado, creado_en
FROM pedidos
WHERE negocio_id = $1 AND estado = 'abierto'
ORDER BY creado_en DESC;
```

## Antes de hacer ALTER TABLE

❌ **NO modificar el schema sin aprobación explícita de Michael.** El bot de n8n depende de columnas y nombres específicos. Cualquier cambio rompe producción.

✅ Si una nueva feature requiere una columna nueva: documenta primero en una migración SQL en `/supabase/migrations/`, propón el cambio, espera aprobación, y luego ejecuta.

## Tipos TypeScript

Generar los tipos de TypeScript automáticamente con la CLI de Supabase:

```bash
npx supabase gen types typescript --project-id <PROJECT_REF> > src/lib/supabase/database.types.ts
```

NO escribir tipos a mano: siempre regenerar tras cualquier cambio de schema.
