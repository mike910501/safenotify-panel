---
name: supabase-schema
description: Schema completo y exacto de la base de datos Supabase de SafeNotify (proyecto safenotify-prod). Cárgala SIEMPRE que vayas a leer, escribir, consultar o crear tipos para cualquier tabla. Incluye columnas, tipos, defaults, relaciones FK, reglas de qué tabla puede tocar el panel, y patrones de comunicación con el bot de n8n.
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
| `pedidos` | Bot n8n | **SOLO LEER.** El cambio de estado se hace via webhook del bot (ver §"Cambio de estado de pedidos"). |
| `interacciones` | Bot n8n | LEER. NO escribir. |
| `sesiones_pausadas` | Panel + Bot | **LEER y ESCRIBIR.** Esta es la vía oficial para que el panel pause el bot. |
| `mensajes_salientes_panel` | Panel | **LEER y ESCRIBIR.** Cola de mensajes que el panel encola para enviar vía Twilio. |
| `chats_activos` | Vista derivada | SOLO LEER. Es VIEW de Postgres con resumen de conversaciones. |
| `usuarios_panel` | Panel | LEER y ESCRIBIR (auth). |

⚠️ **CAMBIO IMPORTANTE (2026-05-10):** El panel **NO hace UPDATE directo** a `pedidos.estado`. Ver sección "Cambio de estado de pedidos" más abajo.

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

**PK:** `negocio_id` (es text legible, ej. "D'Andrés  Comidas Rapidas", no UUID).

⚠️ **Atención:** el `negocio_id` actual de D'Andrés tiene **doble espacio** entre "D'Andrés" y "Comidas". Respetar literal en queries.

### `historial`
Cada mensaje individual entre cliente y bot. Append-only.

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | bigint | NO | `nextval('historial_id_seq')` |
| `negocio_id` | text | NO | - |
| `phone` | text | NO | - |
| `role` | text | NO | - (valores: `'user'`, `'assistant'`) |
| `content` | text | NO | - |
| `enviado_por` | text | NO | `'bot'` (valores observados: `'cliente'`, `'bot'`, `'humano'`) |
| `timestamp` | timestamptz | NO | `now()` |

**FK:** `negocio_id → negocios.negocio_id`
**ATENCIÓN:** El panel NO escribe aquí. Para enviar mensajes desde el panel, usar `mensajes_salientes_panel`.

### `pedidos`
Pedidos confirmados. **El bot los crea Y los actualiza.** El panel SOLO lee.

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` |
| `pedido_id` | text | NO | - (formato: `'PED-{phone}-{fecha}-{corto}'`) |
| `pedido_corto` | integer | NO | - (correlativo dentro del negocio, ej. 1, 2, 3) |
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

#### Estados reales (CONFIRMADOS 2026-05-10)

```
abierto → en_camino  → entregado → (fin)
        → listo      → entregado → (fin)
        → cancelado  → (fin)
```

5 estados válidos:
- `'abierto'` (default al crearse).
- `'en_camino'` (cuando el domicilio sale del local).
- `'listo'` (cuando el pedido para recoger está empacado).
- `'entregado'` (final exitoso).
- `'cancelado'` (final negativo, en cualquier momento del flujo).

**NO existe `'en_preparacion'`.** No lo uses.

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
Resúmenes de conversación generados por el bot (Claude Haiku / DeepSeek). Una fila por (negocio_id, phone).

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` |
| `negocio_id` | text | NO | - |
| `phone` | text | NO | - |
| `resumen` | text | NO | - |
| `updated_at` | timestamptz | NO | `now()` |

**FK:** `negocio_id → negocios.negocio_id`
**Constraint UNIQUE:** `(negocio_id, phone)`.

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

**La VIEW `chats_activos` deriva `bot_pausado` de esta tabla** así:
```sql
COALESCE(
  (SELECT true FROM sesiones_pausadas sp
   WHERE sp.negocio_id = h.negocio_id
     AND sp.phone = h.phone
     AND sp.pausado_hasta > now()),
  false
) AS bot_pausado
```

**Pausar:** `INSERT con pausado_hasta = NOW() + 30 min`.
**Despausar:** `INSERT con pausado_hasta = NOW()` (efectivamente termina la pausa actual).

### `mensajes_salientes_panel`
Cola de mensajes que el panel quiere enviar al cliente. Procesador en n8n PENDIENTE.

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` |
| `negocio_id` | text | NO | - |
| `phone_destino` | text | NO | - |
| `mensaje` | text | NO | - |
| `enviado_por` | text | NO | - (email del usuario del panel) |
| `twilio_sid` | text | YES | null |
| `estado` | text | NO | `'pendiente'` (`'pendiente'`, `'enviado'`, `'error'`) |
| `error_mensaje` | text | YES | null |
| `timestamp` | timestamptz | NO | `now()` |

**FK:** `negocio_id → negocios.negocio_id`

⚠️ **Estado actual:** la tabla existe pero NO hay procesador en n8n que envíe esos mensajes vía Twilio. Por eso el toast del panel debe decir "Mensaje encolado, se enviará en breve" y NO "Mensaje enviado".

### `chats_activos` (VIEW)
Vista derivada con resumen de chats. Solo lectura. Definición real:

```sql
SELECT
  negocio_id,
  phone,
  max(timestamp) AS ultimo_mensaje_at,
  (SELECT h2.content FROM historial h2
   WHERE h2.negocio_id = h.negocio_id AND h2.phone = h.phone
   ORDER BY h2.timestamp DESC LIMIT 1) AS ultimo_mensaje,
  (SELECT h2.role FROM historial h2
   WHERE h2.negocio_id = h.negocio_id AND h2.phone = h.phone
   ORDER BY h2.timestamp DESC LIMIT 1) AS ultimo_role,
  COALESCE((SELECT true FROM sesiones_pausadas sp
   WHERE sp.negocio_id = h.negocio_id AND sp.phone = h.phone
     AND sp.pausado_hasta > now()), false) AS bot_pausado,
  (SELECT count(*) FROM historial h3
   WHERE h3.negocio_id = h.negocio_id AND h3.phone = h.phone
     AND h3.timestamp > now() - interval '24 hours') AS mensajes_24h
FROM historial h
GROUP BY negocio_id, phone
ORDER BY ultimo_mensaje_at DESC
```

**NO tiene `nombre_cliente`.** Para nombres, hacer JOIN o lookup en `pedidos.nombre_cliente` o `interacciones.nombre_cliente`.

### `usuarios_panel`
Usuarios autenticados del panel.

| Columna | Tipo | Nullable | Default |
|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` |
| `clerk_user_id` | text | YES | null (legacy) |
| `email` | text | NO | - (UNIQUE) |
| `nombre` | text | YES | null |
| `negocio_id` | text | NO | - (FK a negocios) |
| `rol` | text | NO | `'operator'` (CHECK: `'owner' | 'operator' | 'admin'`) |
| `activo` | boolean | NO | `true` |
| `ultimo_login` | timestamptz | YES | null |
| `created_at` | timestamptz | NO | `now()` |
| `auth_user_id` | uuid | YES | null (FK a auth.users.id ON DELETE CASCADE, agregada en migración 001) |

## Cambio de estado de pedidos (PATRÓN OBLIGATORIO)

⚠️ **El panel NO hace UPDATE directo a `pedidos.estado`.** Por dos razones:
1. La lógica de notificaciones por WhatsApp (al cliente y al dueño) vive en el workflow de n8n, no en la BD.
2. Si el panel hiciera UPDATE directo, se perderían los WhatsApp.

### Patrón correcto: llamar al webhook del bot

El panel envía una llamada HTTP POST al webhook de Twilio del bot, simulando un mensaje de Claudia con el comando correspondiente.

**URL del webhook:**
```
https://mike1991.app.n8n.cloud/webhook/d10d0428-f16f-4fe1-ba85-7b392b3cdc49
```

**Payload (form-urlencoded, formato Twilio):**
```
Body={comando} {pedido_corto}
From=whatsapp:+{numero_de_contacto_humano}
To=whatsapp:+{twilio_from_del_negocio}
ProfileName=Panel SafeNotify
WaId={numero_sin_+}
```

**Mapping de acciones del panel a comandos del bot:**

| Acción en panel | Comando que se envía |
|---|---|
| Marcar en camino | `camino {pedido_corto}` |
| Marcar listo | `listo {pedido_corto}` |
| Marcar entregado | `entregado {pedido_corto}` |
| Cancelar | `cancelado {pedido_corto}` |

**Ejemplo (Server Action):**
```typescript
async function cambiarEstadoPedido(pedidoCorto: number, accion: "camino" | "listo" | "entregado" | "cancelado") {
  const negocio = await getNegocioOfCurrentUser(); // saca twilio_from y contacto_humano

  const body = new URLSearchParams({
    Body: `${accion} ${pedidoCorto}`,
    From: `whatsapp:${negocio.contacto_humano}`,
    To: `whatsapp:${negocio.twilio_from.replace("whatsapp:", "")}`,
    ProfileName: "Panel SafeNotify",
    WaId: negocio.contacto_humano.replace("+", ""),
  });

  const res = await fetch(BOT_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) throw new Error("Error al enviar comando al bot");
}
```

**Variable de entorno necesaria:**
```
BOT_WEBHOOK_URL=https://mike1991.app.n8n.cloud/webhook/d10d0428-f16f-4fe1-ba85-7b392b3cdc49
```

### ¿Qué hace el bot al recibir el comando?
1. Detecta que es un comando válido (`camino`, `listo`, `entregado`, `cancelado` + número).
2. Busca `pedido_corto = N` con el `negocio_id` correspondiente.
3. Hace UPDATE de `pedidos.estado` con el nuevo estado.
4. Envía WhatsApp al cliente (variando el copy según el estado).
5. Envía WhatsApp a `numeros_notificacion` confirmando el cambio.

### Lo que el panel hace en paralelo
- **Optimistic update:** mostrar al usuario el cambio de estado inmediatamente (sin esperar al bot).
- **Realtime de Supabase:** la suscripción a `pedidos` detectará el UPDATE real cuando el bot lo haga, y refrescará si hay diferencia.
- **Toast de feedback:** "Comando enviado al bot. El cliente recibirá la notificación en segundos."

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
WHERE negocio_id = $1 AND estado IN ('abierto', 'en_camino', 'listo')
ORDER BY creado_en DESC;
```

## Antes de hacer ALTER TABLE

❌ **NO modificar el schema sin aprobación explícita de Michael.** El bot de n8n depende de columnas y nombres específicos. Cualquier cambio rompe producción.

✅ Migraciones ya aprobadas:
- `001_add_auth_user_id.sql` (ejecutada 2026-05-09).

## Tipos TypeScript

Generar los tipos automáticamente con la CLI de Supabase:

```bash
npx supabase gen types typescript --project-id yxdkkqzckvwqxtewyiiw > src/lib/supabase/database.types.ts
```

**O regenerar manualmente** copiando del Dashboard de Supabase → API Docs.

NO escribir tipos a mano: siempre regenerar tras cualquier cambio de schema.
