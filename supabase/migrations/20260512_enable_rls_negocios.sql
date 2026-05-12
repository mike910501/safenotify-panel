-- Migración 20260512_enable_rls_negocios
-- Aprobación: PENDIENTE de Michael Ladino. NO ejecutar sin OK explícito.
-- Razón: aislar acceso a `negocios` por rol y por negocio_id ahora que
-- vamos a tener admin panel separado del panel del cliente final.
--
-- ============================================================================
-- ATENCION CRITICA -- VERIFICAR ANTES DE EJECUTAR
-- ============================================================================
-- Esta migración habilita RLS en `negocios`. Si el workflow de n8n consulta
-- `negocios` usando la ANON KEY, perderá acceso y el bot DEJA DE FUNCIONAR.
--
-- VERIFICAR EN n8n ANTES DE EJECUTAR:
--   1. Abrir https://mike1991.app.n8n.cloud
--   2. Editar el workflow del bot
--   3. Buscar el/los nodo(s) "Supabase" -> Credentials
--   4. Decodificar el JWT de la key usada (en https://jwt.io o similar)
--   5. Confirmar que dice {"role":"service_role"} (NO "anon")
--
-- Si dice service_role: proceder. Service-role bypassa RLS por diseño de
--   Supabase y todas las consultas del bot siguen funcionando idénticas.
--
-- Si dice anon: NO EJECUTAR esta migración. Primero hay que actualizar
--   la credencial del nodo Supabase en n8n a la service-role key. Recién
--   después aplicar este SQL.
-- ============================================================================
--
-- Impacto en el panel web (este repo):
--   - Server Actions que usan service-role (ej. submitOnboarding): sin
--     cambios, bypassan RLS.
--   - Server/Client components que usan anon-key con cookies de Supabase
--     Auth: el usuario logueado debe tener una fila activa en
--     `usuarios_panel` con su auth_user_id matcheando auth.uid(). Si no,
--     `negocios` se ve vacío. Esto coincide con lo que ya espera el panel.
--
-- Patrón idempotente: re-ejecutable sin error.

ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;

-- Admin: control total
DROP POLICY IF EXISTS negocios_admin_all ON public.negocios;
CREATE POLICY negocios_admin_all ON public.negocios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_panel up
      WHERE up.auth_user_id = auth.uid()
        AND up.rol = 'admin'
        AND up.activo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios_panel up
      WHERE up.auth_user_id = auth.uid()
        AND up.rol = 'admin'
        AND up.activo = true
    )
  );

-- Owner / operator: SELECT solo de su negocio_id
DROP POLICY IF EXISTS negocios_owner_operator_select ON public.negocios;
CREATE POLICY negocios_owner_operator_select ON public.negocios
  FOR SELECT
  TO authenticated
  USING (
    negocio_id IN (
      SELECT up.negocio_id FROM public.usuarios_panel up
      WHERE up.auth_user_id = auth.uid()
        AND up.rol IN ('owner', 'operator')
        AND up.activo = true
    )
  );

-- Owner / operator: UPDATE solo de su negocio_id
-- (sin INSERT ni DELETE: la creación y baja la maneja admin)
DROP POLICY IF EXISTS negocios_owner_operator_update ON public.negocios;
CREATE POLICY negocios_owner_operator_update ON public.negocios
  FOR UPDATE
  TO authenticated
  USING (
    negocio_id IN (
      SELECT up.negocio_id FROM public.usuarios_panel up
      WHERE up.auth_user_id = auth.uid()
        AND up.rol IN ('owner', 'operator')
        AND up.activo = true
    )
  )
  WITH CHECK (
    negocio_id IN (
      SELECT up.negocio_id FROM public.usuarios_panel up
      WHERE up.auth_user_id = auth.uid()
        AND up.rol IN ('owner', 'operator')
        AND up.activo = true
    )
  );
