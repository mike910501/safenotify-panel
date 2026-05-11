"use client";

import { useAnimationControls } from "framer-motion";

const SHAKE_KEYFRAMES = { x: [0, -6, 6, -4, 4, 0] };

export function useInvalidShake() {
  const controls = useAnimationControls();

  function shake() {
    void controls.start({
      ...SHAKE_KEYFRAMES,
      transition: { duration: 0.4, ease: "easeInOut" },
    });
  }

  return { controls, shake };
}
