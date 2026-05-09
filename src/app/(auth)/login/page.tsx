import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export default async function LoginPage() {
  const usuario = await getCurrentUser();
  if (usuario) redirect("/conversaciones");

  return (
    <Card className="w-full max-w-sm shadow-sm">
      <CardHeader className="pb-4 text-center">
        <h1 className="text-xl font-medium">SafeNotify Panel</h1>
        <p className="text-sm text-muted-foreground">
          Inicia sesión para continuar
        </p>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
