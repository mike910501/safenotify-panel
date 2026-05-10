"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { MessagesSquare, ShoppingBag, BarChart3, Settings } from "lucide-react";
import { SPRING, DURATION } from "@/lib/motion/springs";

const ITEMS = [
  { href: "/conversaciones", label: "Chats", Icon: MessagesSquare },
  { href: "/pedidos", label: "Pedidos", Icon: ShoppingBag },
  { href: "/metricas", label: "Métricas", Icon: BarChart3 },
  { href: "/configuracion", label: "Configurar", Icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex"
      style={{
        background: "rgba(20, 12, 38, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <motion.button
            key={href}
            onClick={() => router.push(href)}
            whileTap={{ scale: 0.9 }}
            transition={SPRING.snappy}
            className="flex-1 relative flex flex-col items-center justify-center py-2 min-h-[56px]"
          >
            {/* Indicador animado con layoutId — viaja entre tabs */}
            <AnimatePresence>
              {active && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  transition={SPRING.smooth}
                  className="absolute top-0 inset-x-6 h-0.5"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, #C4B5FD, transparent)",
                    boxShadow: "0 0 12px rgba(196,181,253,0.6)",
                  }}
                />
              )}
            </AnimatePresence>

            <motion.div
              animate={{
                scale: active ? 1.1 : 1,
                color: active ? "#C4B5FD" : "rgba(255,255,255,0.5)",
              }}
              transition={SPRING.snappy}
            >
              <Icon className="h-5 w-5" />
            </motion.div>

            <motion.span
              animate={{
                color: active ? "#C4B5FD" : "rgba(255,255,255,0.4)",
                fontWeight: active ? 600 : 500,
              }}
              transition={{ duration: DURATION.fast }}
              className="text-[10px] mt-0.5"
            >
              {label}
            </motion.span>
          </motion.button>
        );
      })}
    </nav>
  );
}
