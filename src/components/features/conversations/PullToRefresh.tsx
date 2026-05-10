"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Loader2 } from "lucide-react";
import { SPRING } from "@/lib/motion/springs";
import type { PanInfo } from "framer-motion";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const y = useMotionValue(0);
  const indicatorOpacity = useTransform(y, [0, 40, 80], [0, 0.5, 1]);
  const indicatorRotate = useTransform(y, [0, 80], [0, 180]);
  const [refreshing, setRefreshing] = useState(false);

  async function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 80 && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  }

  return (
    <div className="relative h-full overflow-hidden">
      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="absolute top-3 inset-x-0 flex justify-center z-10 pointer-events-none"
      >
        <motion.div
          style={{ rotate: refreshing ? 0 : indicatorRotate }}
          animate={refreshing ? { rotate: 360 } : {}}
          transition={
            refreshing
              ? { repeat: Infinity, duration: 0.8, ease: "linear" }
              : SPRING.smooth
          }
        >
          <Loader2 className="h-5 w-5 text-white/70" />
        </motion.div>
      </motion.div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.4, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{ y }}
        transition={SPRING.smooth}
        className="h-full overflow-y-auto"
      >
        {children}
      </motion.div>
    </div>
  );
}
