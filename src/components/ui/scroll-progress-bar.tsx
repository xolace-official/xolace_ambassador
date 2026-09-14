"use client";

import { motion, useScroll, useSpring } from "motion/react";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary z-50 origin-left shadow-[0_0_12px_rgba(var(--color-primary),0.8)] pointer-events-none"
      style={{ scaleX }}
    />
  );
}
