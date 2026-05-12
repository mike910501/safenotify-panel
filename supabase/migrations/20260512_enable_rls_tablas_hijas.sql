-- Migración 20260512_enable_rls_tablas_hijas
-- Aprobación: PENDIENTE de Michael Ladino. NO ejecutar sin OK explícito.
-- Razón: aislar lectura/escritura de las tablas operacionales del bot por
-- negocio, ahora que el panel del cliente final solo debe ver lo suyo.
--
-- ============================================================================
-- ATENCION CRITICA -- VERIFICAR ANTES DE EJECUTAR
-- ============================================================================
-- Esta migración habilita RLS en 6 tablas que el BOT DE n8n escribe.
-- Si n8n consulta/escribe usando la ANON KEY, perderá acceso y el bot se
-- ROMPE COMPLETAMENTE (no podrá guardar mensajes, pedidos, ni resúmenes).
--
-- Misma verificación que `20260512_enable_rls_negocios.sql`: confirmar que
-- n8n usa service-role key (no anon) ANTES de ejecutar.
--
-- Si las dos migraciones de RLS (negocios + tablas_hijas) se aplicarán
-- juntas, conviene aplicar PRIMERO esta (afecta lectura del bot) y luego
-- negocios. Si algo se rompe, se nota antes.
-- ============================================================================
--
-- Diseño de policies por tabla (alineado con `supabase-schema` SKILL):
--
--   admin (rol='admin'):
--     -> FOR ALL en todas las tablas
--
--   owner / operator:
--     -> historial, resumenes, pedidos, interacciones:
--          FOR SELECT solo (escritura es exclusiva del bot)
--     -> sesiones_pausadas, mensajes_salientes_panel:
--          FOR SELECT + FOR INSERT (el panel pausa el bot y encola msgs)
--          (sin UPDATE/DELETE: las pausas expiran solas, los mensajes los
--           marca como enviados el procesador del bot)
--
-- Patrón idempotente: re-ejecutable sin error.

-- =============================================================================
-- historial
-- =============================================================================
ALTER TABLE public.historial ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS historial_admin_all ON public.historial;
CREATE POLICY historial_admin_all ON public.historial
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.usuarios_panel up
            WHERE up.auth_user_id = auth.uid()
              AND up.rol = 'admin' AND up.activo = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.usuarios_panel up
            WHERE up.auth_user_id = auth.uid()
              AND up.rol = 'admin' AND up.activo = true)
  );

DROP POLICY IF EXISTS historial_owner_operator_select ON public.historial;
CREATE POLICY historial_owner_operator_select ON public.historial
  FOR SELECT TO authenticated
  USING (
    negocio_id IN (
      SELECT up.negocio_id FROM public.usuarios_panel up
      WHERE up.auth_user_id = auth.uid()
        AND up.rol IN ('owner', 'operator') AND up.activo = true
    )
  );

-- =============================================================================
-- resumenes
-- =============================================================================
ALTER TABLE public.resumenes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS resumenes_admin_all ON public.resumenes;
CREATE POLICY resumenes_admin_all ON public.resumenes
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.usuarios_panel up
            WHERE up.auth_user_id = auth.uid()
              AND up.rol = 'admin' AND up.activo = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.usuarios_panel up
            WHERE up.auth_user_id = auth.uid()
              AND up.rol = 'admin' AND up.activo = true)
  );

DROP POLICY IF EXISTS resumenes_owner_operator_select ON public.resumenes;
CREATE POLICY resumenes_owner_operator_select ON public.resumenes
  FOR SELECT TO authenticated
  USING (
    negocio_id IN (
      SELECT up.negocio_id FROM public.usuarios_panel up
      WHERE up.auth_user_id = auth.uid()
        AND up.rol IN ('owner', 'operator') AND up.activo = true
    )
  );

-- =============================================================================
-- pedidos
-- =============================================================================
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pedidos_admin_all ON public.pedidos;
CREATE POLICY pedidos_admin_all ON public.pedidos
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.usuarios_panel up
            WHERE up.auth_user_id = auth.uid()
              AND up.rol = 'admin' AND up.activo = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.usuarios_panel up
            WHERE up.auth_user_id = auth.uid()
              AND up.rol = 'admin' AND up.activo = true)
  );

DROP POLICY IF EXISTS pedidos_owner_operator_select ON public.pedidos;
CREATE POLICY pedidos_owner_operator_select ON public.pedidos
  FOR SELECT TO authenticated
  USING (
    negocio_id IN (
      SELECT up.negocio_id FROM public.usuarios_panel up
      WHERE up.auth_user_id = auth.uid()
        AND up.rol IN ('owner', 'operator') AND up.activo = true
    )
  );

-- =============================================================================
-- interacciones
-- =============================================================================
ALTER TABLE public.interacciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS interacciones_admin_all ON public.interacciones;
CREATE POLICY interacciones_admin_all ON public.interacciones
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.usuarios_panel up
            WHERE up.auth_user_id = auth.uid()
              AND up.rol = 'admin' AND up.activo = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.usuarios_panel up
            WHERE up.auth_user_id = auth.uid()
              AND up.rol = 'admin' AND up.activo = true)
  );

DROP POLICY IF EXISTS interacciones_owner_operator_select ON public.interacciones;
CREATE POLICY interacciones_owner_operator_select ON public.interacciones
  FOR SELECT TO authenticated
  USING (
    negocio_id IN (
      SELECT up.negocio_id FROM public.usuarios_panel up
      WHERE up.auth_user_id = auth.uid()
        AND up.rol IN ('owner', 'operator') AND up.activo = true
    )
  );

-- =============================================================================
-- sesiones_pausadas (owner/operator escribe para pausar el bot)
-- =============================================================================
ALTER TABLE public.sesiones_pausadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sesiones_pausadas_admin_all ON public.sesiones_pausadas;
CREATE POLICY sesiones_pausadas_admin_all ON public.sesiones_pausadas
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.usuarios_panel up
            WHERE up.auth_user_id = auth.uid()
              AND up.rol = 'admin' AND up.activo = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.usuarios_panel up
            WHERE up.auth_user_id = auth.uid()
              AND up.rol = 'admin' AND up.activo = true)
  );

DROP POLICY IF EXISTS sesiones_pausadas_owner_operator_select ON public.sesiones_pausadas;
CREATE POLICY sesiones_pausadas_owner_operator_select ON public.sesiones_pausadas
  FOR SELECT TO authenticated
  USING (
    negocio_id IN (
      SELECT up.negocio_id FROM public.usuarios_panel up
      WHERE up.auth_user_id = auth.uid()
        AND up.rol IN ('owner', 'operator') AND up.activo = true
    )
  );

DROP POLICY IF EXISTS sesiones_pausadas_owner_operator_insert ON public.sesiones_pausadas;
CREATE POLICY sesiones_pausadas_owner_operator_insert ON public.sesiones_pausadas
  FOR INSERT TO authenticated
  WITH CHECK (
    negocio_id IN (
      SELECT up.negocio_id FROM public.usuarios_panel up
      WHERE up.auth_user_id = auth.uid()
        AND up.rol IN ('owner', 'operator') AND up.activo = true
    )
  );

-- =============================================================================
-- mensajes_salientes_panel (owner/operator encola mensajes manuales)
-- =============================================================================
ALTER TABLE public.mensajes_salientes_panel ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mensajes_salientes_panel_admin_all ON public.mensajes_salientes_panel;
CREATE POLICY mensajes_salientes_panel_admin_all ON public.mensajes_salientes_panel
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.usuarios_panel up
            WHERE up.auth_user_id = auth.uid()
              AND up.rol = 'admin' AND up.activo = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.usuarios_panel up
            WHERE up.auth_user_id = auth.uid()
              AND up.rol = 'admin' AND up.activo = true)
  );

DROP POLICY IF EXISTS mensajes_salientes_panel_owner_operator_select ON public.mensajes_salientes_panel;
CREATE POLICY mensajes_salientes_panel_owner_operator_select ON public.mensajes_salientes_panel
  FOR SELECT TO authenticated
  USING (
    negocio_id IN (
      SELECT up.negocio_id FROM public.usuarios_panel up
      WHERE up.auth_user_id = auth.uid()
        AND up.rol IN ('owner', 'operator') AND up.activo = true
    )
  );

DROP POLICY IF EXISTS mensajes_salientes_panel_owner_operator_insert ON public.mensajes_salientes_panel;
CREATE POLICY mensajes_salientes_panel_owner_operator_insert ON public.mensajes_salientes_panel
  FOR INSERT TO authenticated
  WITH CHECK (
    negocio_id IN (
      SELECT up.negocio_id FROM public.usuarios_panel up
      WHERE up.auth_user_id = auth.uid()
        AND up.rol IN ('owner', 'operator') AND up.activo = true
    )
  );
