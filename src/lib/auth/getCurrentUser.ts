import { createClient } from "@/lib/supabase/server";

export type UsuarioActual = {
  id: string;
  authUserId: string;
  email: string;
  nombre: string | null;
  rol: "owner" | "operator" | "admin";
  negocioId: string;
  nombreNegocio: string;
  ultimoLogin: string | null;
};

export async function getCurrentUser(): Promise<UsuarioActual | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: usuario } = await supabase
    .from("usuarios_panel")
    .select("id, email, nombre, rol, negocio_id, ultimo_login")
    .eq("auth_user_id", user.id)
    .eq("activo", true)
    .maybeSingle();

  if (!usuario) return null;

  const { data: negocio } = await supabase
    .from("negocios")
    .select("nombre_negocio")
    .eq("negocio_id", usuario.negocio_id)
    .maybeSingle();

  return {
    id: usuario.id,
    authUserId: user.id,
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
    negocioId: usuario.negocio_id,
    nombreNegocio: negocio?.nombre_negocio ?? usuario.negocio_id,
    ultimoLogin: usuario.ultimo_login,
  };
}
