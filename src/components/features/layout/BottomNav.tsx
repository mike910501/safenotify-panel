"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessagesSquare, ShoppingBag, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/conversaciones", label: "Chats", icon: MessagesSquare },
  { href: "/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/metricas", label: "Métricas", icon: BarChart3 },
  { href: "/configuracion", label: "Configurar", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch"
      style={{
        background: "rgba(10,14,39,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 pt-2 transition-colors duration-200",
              "min-h-[44px]"
            )}
            style={{
              color: isActive ? "var(--glow-primary-soft)" : "rgba(255,255,255,0.50)",
            }}
          >
            <Icon
              className="h-5 w-5 shrink-0"
              style={{
                filter: isActive
                  ? "drop-shadow(0 0 8px rgba(139,92,246,0.60))"
                  : undefined,
              }}
            />
            <span
              className="text-[10px] font-medium leading-none"
              style={{
                color: isActive ? "var(--glow-primary-soft)" : "rgba(255,255,255,0.50)",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
