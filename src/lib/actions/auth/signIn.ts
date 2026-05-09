"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export async function signIn(input: SignInInput): Promise<{ error: string }> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

  if (authError || !authData.user) {
    const code = authError?.code ?? "";
    if (code === "invalid_credentials") {
      return { error: "Email o contraseña incorrectos" };
    }
    if (code === "email_not_confirmed") {
      return { error: "Tu cuenta está pendiente de verificación" };
    }
    if (
      code === "over_request_rate_limit" ||
      authError?.message?.toLowerCase().includes("rate limit")
    ) {
      return { error: "Demasiados intentos, espera unos minutos" };
    }
    // TODO: log a sistema de observabilidad
    return { error: "Error inesperado, intenta de nuevo" };
  }

  const { data: usuario } = await supabase
    .from("usuarios_panel")
    .select("id, activo")
    .eq("auth_user_id", authData.user.id)
    .maybeSingle();

  if (!usuario || !usuario.activo) {
    await supabase.auth.signOut();
    return {
      error: "Tu cuenta no está habilitada. Contacta al administrador.",
    };
  }

  await supabase
    .from("usuarios_panel")
    .update({ ultimo_login: new Date().toISOString() })
    .eq("id", usuario.id);

  redirect("/conversaciones");
}
