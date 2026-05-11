"use client";

import { useAnimationControls } from "framer-motion";
import { SPRING } from "@/lib/motion/springs";

const SHAKE_KEYFRAMES = { x: [0, -6, 6, -4, 4, 0] };

export function useInvalidShake() {
  const controls = useAnimationControls();

  function shake() {
    void controls.start({
      ...SHAKE_KEYFRAMES,
      transition: SPRING.snappy,
    });
  }

  return { controls, shake };
}
