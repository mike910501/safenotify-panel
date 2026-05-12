-- Migración 20260512_create_leads_table
-- Aprobación: PENDIENTE de Michael Ladino. NO ejecutar sin OK explícito.
-- Razón: capturar leads del wizard público de onboarding (/onboarding).
-- A partir de Fase A, el wizard NO crea cuentas directas: persiste payload
-- en esta tabla. Michael revisa desde el admin panel y decide si convertir
-- en un negocio real (creando manualmente el registro en `negocios` y la
-- cuenta en `usuarios_panel`).
--
-- Impacto en el bot de n8n: ninguno. El bot no consulta `leads`.
-- Impacto en wizard actual: cuando se aplique esta migración, el wizard
-- todavía sigue creando cuentas directamente. La transición del wizard
-- a "solo lead" se hará en Fase B (código), no en esta fase.
--
-- Patrón idempotente: usa IF NOT EXISTS / DROP POLICY IF EXISTS para que
-- la migración pueda re-ejecutarse sin error si ya fue aplicada.

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_negocio text NOT NULL,
  tipo_negocio text,
  contacto_nombre text NOT NULL,
  contacto_email text NOT NULL,
  contacto_telefono text,
  ciudad text,
  payload_wizard jsonb NOT NULL,
  estado text NOT NULL DEFAULT 'nuevo'
    CHECK (estado IN ('nuevo', 'contactado', 'convertido', 'descartado')),
  notas_admin text,
  negocio_id text REFERENCES public.negocios(negocio_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_estado_idx
  ON public.leads (estado);

CREATE INDEX IF NOT EXISTS leads_created_at_desc_idx
  ON public.leads (created_at DESC);

-- RLS: tabla SOLO accesible para rol='admin' a través de usuarios_panel.
-- El wizard escribe vía service-role (Server Action con admin client),
-- que bypassa RLS por diseño de Supabase. Anon NO tiene acceso.

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS leads_admin_all ON public.leads;
CREATE POLICY leads_admin_all ON public.leads
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
