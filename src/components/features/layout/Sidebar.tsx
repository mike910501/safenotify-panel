"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessagesSquare,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UsuarioActual } from "@/lib/auth/getCurrentUser";
import { signOut } from "@/lib/actions/auth/signOut";

interface SidebarProps {
  usuario: UsuarioActual;
}

const navItems = [
  { href: "/conversaciones", label: "Conversaciones", icon: MessagesSquare },
  { href: "/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/metricas", label: "Métricas", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

function UserAvatar({ nombre, email }: { nombre: string | null; email: string }) {
  const initial = (nombre ?? email).charAt(0).toUpperCase();
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium shrink-0">
      {initial}
    </div>
  );
}

export function Sidebar({ usuario }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[200px] shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
      {/* User info header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <UserAvatar nombre={usuario.nombre} email={usuario.email} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {usuario.nombre ?? usuario.email}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {usuario.nombreNegocio}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-0.5"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              {/* TODO: conectar con count real desde useChatsRealtime */}
              {href === "/conversaciones" && (
                <span
                  className={cn(
                    "ml-auto flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium",
                    isActive
                      ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                      : "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  0
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out footer */}
      <div className="px-2 py-3 border-t border-sidebar-border">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-0.5"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
