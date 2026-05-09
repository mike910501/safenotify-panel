-- Migración 001: agregar auth_user_id a usuarios_panel
-- Aprobado por Michael Ladino el 2026-05-09.
-- Razón: vincular cada usuario_panel con un usuario de Supabase Auth para
-- que el panel web pueda autenticar y autorizar acceso por negocio.
-- Nota: esta columna es NULLABLE y NO afecta al bot de n8n. El bot no
-- consulta usuarios_panel, solo el panel web. La FK con ON DELETE CASCADE
-- asegura limpieza si se borra el auth.user.

ALTER TABLE usuarios_panel ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX idx_usuarios_panel_auth_user_id ON usuarios_panel(auth_user_id);
