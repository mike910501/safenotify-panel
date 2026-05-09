import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RecuperarAccesoPage() {
  return (
    <Card className="w-full max-w-sm shadow-sm">
      <CardHeader className="pb-4 text-center">
        <h1 className="text-xl font-medium">Recuperar acceso</h1>
      </CardHeader>
      <CardContent className="space-y-5 text-center">
        <p className="text-sm text-muted-foreground">
          Por ahora la recuperación de contraseña es asistida. Escríbenos por
          WhatsApp y te ayudamos en minutos.
        </p>

        <Button asChild className="w-full">
          <a
            href="https://wa.me/573133592457?text=Hola%2C%20necesito%20recuperar%20mi%20acceso%20al%20panel%20SafeNotify"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir WhatsApp
          </a>
        </Button>

        <Link
          href="/login"
          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Volver al inicio de sesión
        </Link>

        <p className="text-xs text-muted-foreground">
          Próximamente: recuperación automática por email.
        </p>
      </CardContent>
    </Card>
  );
}
