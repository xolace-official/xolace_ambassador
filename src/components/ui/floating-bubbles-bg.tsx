"use client";

import { motion } from "motion/react";

interface Bubble {
  id: number;
  size: number;
  leftPct: number;
  topPct: number;
  duration: number;
  delay: number;
}

export default function FloatingBubblesBg({
  className = "",
}: {
  className?: string;
}) {
  const bubbles: Bubble[] = [
    { id: 1, size: 90, leftPct: 10, topPct: 20, duration: 14, delay: 0 },
    { id: 2, size: 140, leftPct: 75, topPct: 15, duration: 18, delay: 2 },
    { id: 3, size: 110, leftPct: 45, topPct: 60, duration: 16, delay: 4 },
    { id: 4, size: 70, leftPct: 85, topPct: 70, duration: 12, delay: 1 },
    { id: 5, size: 120, leftPct: 20, topPct: 75, duration: 20, delay: 3 },
  ];

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="absolute rounded-full border border-primary/25 bg-primary/5 backdrop-blur-[1px]"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.leftPct}%`,
            top: `${b.topPct}%`,
          }}
          animate={{
            y: [-15, 15, -15],
            x: [-10, 10, -10],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: b.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: b.delay,
          }}
        />
      ))}
    </div>
  );
}
