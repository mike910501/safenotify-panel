# Migraciones de Supabase

Migraciones SQL del proyecto `safenotify-prod`. Se aplican **manualmente** desde el SQL Editor del Dashboard de Supabase. Este repo no usa la CLI de Supabase para aplicarlas automáticamente.

## Estado de las migraciones

| Archivo | Estado | Aplicada el | Notas |
|---|---|---|---|
| `001_add_auth_user_id.sql` | ✅ Ejecutada | 2026-05-09 | Vincula `usuarios_panel` con `auth.users`. |
| `20260512_create_leads_table.sql` | ⏳ Pendiente | — | Tabla `leads` para capturar wizard. No afecta al bot. |
| `20260512_enable_rls_negocios.sql` | ⏳ Pendiente | — | **VERIFICAR n8n** antes de ejecutar. |
| `20260512_enable_rls_tablas_hijas.sql` | ⏳ Pendiente | — | **VERIFICAR n8n** antes de ejecutar. |

Después de aplicar cada una, actualizar la columna "Aplicada el" con la fecha.

## Convención de naming

- Migraciones legacy: `NNN_descripcion.sql` (`001_add_auth_user_id.sql`).
- Migraciones nuevas (desde Fase A admin panel): `YYYYMMDD_descripcion.sql`.

El orden de ejecución sigue el orden alfanumérico de los nombres. Si dos migraciones se generan el mismo día, agregar sufijo `_a`, `_b`, etc.

## Cómo aplicar una migración

1. Abrir [Supabase Dashboard](https://supabase.com/dashboard) → proyecto `safenotify-prod`.
2. Ir a **SQL Editor** (ícono de terminal en el sidebar).
3. Click en **New query**.
4. Pegar el contenido completo del archivo `.sql`.
5. Revisar el header del archivo: si dice "VERIFICAR antes de ejecutar", hacer la verificación pedida.
6. Click **Run** (Cmd/Ctrl+Enter).
7. Verificar el resultado abajo: debería decir "Success. No rows returned" (para migraciones de schema).
8. Si error: NO tocar nada más. Copiar el error completo, reportar a Michael.
9. Si OK: actualizar la fila correspondiente en la tabla de estado arriba con la fecha.

## Verificaciones previas (antes de aplicar las 3 de hoy)

### 1. Confirmar que n8n usa service-role key (CRÍTICO para RLS)

Si n8n usa anon, las migraciones de RLS rompen el bot. Pasos:

1. Abrir <https://mike1991.app.n8n.cloud>.
2. Editar el workflow del bot.
3. Para cada nodo "Supabase" del workflow → ver Credentials → ver el JWT.
4. Decodificar el JWT en <https://jwt.io>. Confirmar que el payload dice `"role":"service_role"` (NO `"anon"`).

Si dice service_role: ✅ aplicar las migraciones de RLS sin temor.
Si dice anon: ❌ NO aplicar. Primero actualizar n8n a service-role key.

### 2. Verificar que la tabla `leads` no existe (para evitar conflicto)

En SQL Editor:
```sql
SELECT to_regclass('public.leads');
```

- Si devuelve `null`: ✅ no existe, proceder.
- Si devuelve `leads`: ⚠️ ya existe. Las migraciones son idempotentes (`CREATE TABLE IF NOT EXISTS`), pero conviene confirmar con Michael por qué existía antes.

### 3. Verificar estado actual de RLS por tabla

```sql
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relname IN ('negocios','historial','interacciones','pedidos',
                  'resumenes','sesiones_pausadas','mensajes_salientes_panel',
                  'usuarios_panel','leads')
ORDER BY relname;
```

Esperado pre-Fase-A: todas con `relrowsecurity = false`. Si alguna ya está en `true`, reportar a Michael (puede ser configuración previa que no estaba documentada).

## Orden recomendado para Fase A

Aplicar en este orden exacto:

```
1. 20260512_create_leads_table.sql       (independiente, baja riesgo)
2. 20260512_enable_rls_tablas_hijas.sql  (más alta exposición — si rompe, se ve antes)
3. 20260512_enable_rls_negocios.sql      (última — depende de las anteriores)
```

Justificación del orden:
- `leads` primero porque no toca tablas existentes y no impacta el bot.
- `tablas_hijas` antes que `negocios` porque las tablas hijas reciben más tráfico del bot — si algo se rompe, lo notamos enseguida.
- `negocios` al final porque sus policies hacen subqueries a `usuarios_panel` y queremos que esa lógica funcione antes de bloquear el acceso al config principal.

## Después de aplicar todo

1. Probar que el bot de n8n sigue respondiendo:
   - Enviar un mensaje de WhatsApp al número de D'Andrés.
   - Confirmar que el bot responde en ≤ 30s.
   - Confirmar en Supabase Dashboard que el mensaje quedó en `historial`.
2. Probar que el panel de Claudia sigue funcionando:
   - Login con `claudia@...` → debe entrar.
   - Ver conversaciones → debe ver las de su negocio_id.
   - Pausar el bot en un chat → INSERT a sesiones_pausadas debe pasar.
3. Si todo OK: regenerar tipos TypeScript del repo:
   ```bash
   npx supabase gen types typescript --project-id yxdkkqzckvwqxtewyiiw > src/lib/supabase/database.types.ts
   ```
4. Actualizar la tabla de estado en este README con las fechas.

## Rollback

Si una migración de RLS rompe algo en producción, revertirla:

```sql
-- Para una tabla específica
ALTER TABLE public.{tabla} DISABLE ROW LEVEL SECURITY;
-- (las policies quedan creadas pero inactivas hasta re-enable)
```

Para rollback completo (todas las RLS de Fase A):

```sql
ALTER TABLE public.negocios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interacciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_pausadas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_salientes_panel DISABLE ROW LEVEL SECURITY;
```

La tabla `leads` no requiere rollback de RLS aparte (puede mantenerla habilitada; no tiene datos legacy ni afecta al bot).

## Aprobación de migraciones futuras

Cada migración debe ser aprobada explícitamente por Michael Ladino. Ver regla dura #1 en `CLAUDE.md`. Las migraciones de esta carpeta son los únicos cambios de schema permitidos.
