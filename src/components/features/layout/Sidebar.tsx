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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <div
      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium shrink-0 text-white"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.18)",
        transition: "border-color 200ms ease-out, box-shadow 200ms ease-out",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(139,92,246,0.60)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 0 12px rgba(139,92,246,0.30)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.18)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {initial}
    </div>
  );
}

export function Sidebar({ usuario }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="glass-sidebar hidden md:flex h-screen w-[200px] shrink-0 flex-col"
    >
      {/* User info header */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <UserAvatar nombre={usuario.nombre} email={usuario.email} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {usuario.nombre ?? usuario.email}
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p
                  className="line-clamp-2 text-xs leading-tight cursor-default"
                  style={{ color: "rgba(255,255,255,0.50)" }}
                >
                  {usuario.nombreNegocio}
                </p>
              </TooltipTrigger>
              {usuario.nombreNegocio && (
                <TooltipContent side="right">
                  {usuario.nombreNegocio}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
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
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ease-out",
                isActive
                  ? "scale-[1.02]"
                  : "hover:scale-[1.02] hover:translate-x-[2px]"
              )}
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(to right, rgba(139,92,246,0.20), rgba(59,130,246,0.10))",
                      border: "1px solid rgba(139,92,246,0.40)",
                      boxShadow: "0 0 20px rgba(139,92,246,0.25)",
                      color: "#FFFFFF",
                    }
                  : {
                      color: "rgba(255,255,255,0.70)",
                      border: "1px solid transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    "rgba(255,255,255,0.10)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#FFFFFF";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(255,255,255,0.70)";
                }
              }}
            >
              <Icon
                className="h-4 w-4 shrink-0 transition-colors duration-200"
                style={{ color: isActive ? "var(--glow-primary-soft)" : "inherit" }}
              />
              <span>{label}</span>
              {/* TODO: conectar con count real desde useChatsRealtime */}
              {href === "/conversaciones" && (
                <span
                  className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium"
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(139,92,246,0.20)",
                    color: isActive ? "#FFFFFF" : "#A78BFA",
                  }}
                >
                  0
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out footer */}
      <div
        className="px-2 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-out hover:translate-x-[2px]"
            style={{
              background: "rgba(244,168,166,0.10)",
              border: "1px solid rgba(244,168,166,0.30)",
              color: "#F4A8A6",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(244,168,166,0.18)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 16px rgba(244,168,166,0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(244,168,166,0.10)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
