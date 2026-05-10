"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { SPRING } from "@/lib/motion/springs";
import type { PanInfo } from "framer-motion";

interface SwipeBackContainerProps {
  children: React.ReactNode;
}

/**
 * Envuelve el detalle de conversación en mobile para habilitar swipe-back nativo.
 * Solo renderiza el wrapper drag en mobile; en SSR y desktop renderiza el contenido pelado.
 */
export function SwipeBackContainer({ children }: SwipeBackContainerProps) {
  const router = useRouter();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 200], [1, 0.5]);

  // Detectar mobile con useEffect para evitar problemas de SSR
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > 100 || info.velocity.x > 500) {
      router.push("/conversaciones");
    }
  }

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.4 }}
      onDragEnd={handleDragEnd}
      style={{ x, opacity }}
      transition={SPRING.smooth}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
