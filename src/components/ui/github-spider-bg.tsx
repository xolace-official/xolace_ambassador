"use client";

import { motion } from "motion/react";

interface Node {
  id: number;
  cx: number;
  cy: number;
  r: number;
}

interface Edge {
  from: number;
  to: number;
}

export default function GithubSpiderBg({
  className = "",
}: {
  className?: string;
}) {
  // Fixed constellation spider nodes
  const nodes: Node[] = [
    { id: 1, cx: 120, cy: 90, r: 3.5 },
    { id: 2, cx: 340, cy: 180, r: 4 },
    { id: 3, cx: 220, cy: 360, r: 3 },
    { id: 4, cx: 580, cy: 110, r: 4.5 },
    { id: 5, cx: 760, cy: 260, r: 3.5 },
    { id: 6, cx: 940, cy: 120, r: 4 },
    { id: 7, cx: 1080, cy: 340, r: 3 },
    { id: 8, cx: 460, cy: 320, r: 4 },
    { id: 9, cx: 820, cy: 410, r: 3.5 },
  ];

  // Interconnecting spider graph edges
  const edges: Edge[] = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 8 },
    { from: 4, to: 5 },
    { from: 4, to: 8 },
    { from: 5, to: 6 },
    { from: 5, to: 9 },
    { from: 6, to: 7 },
    { from: 8, to: 9 },
  ];

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-30 ${className}`}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 480"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* Connecting spider lines */}
        {edges.map((edge, index) => {
          const start = nodes.find((n) => n.id === edge.from)!;
          const end = nodes.find((n) => n.id === edge.to)!;
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={start.cx}
                y1={start.cy}
                x2={end.cx}
                y2={end.cy}
                stroke="var(--color-primary)"
                strokeOpacity="0.35"
                strokeWidth="1.2"
                strokeDasharray="4 6"
              />
              {/* Pulse beam along path */}
              <motion.circle
                r="2.5"
                fill="var(--color-primary)"
                initial={{
                  cx: start.cx,
                  cy: start.cy,
                  opacity: 0.2,
                }}
                animate={{
                  cx: [start.cx, end.cx, start.cx],
                  cy: [start.cy, end.cy, start.cy],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 6 + (index % 3) * 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: index * 0.4,
                }}
              />
            </g>
          );
        })}

        {/* Node points */}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r + 4}
              fill="var(--color-primary)"
              fillOpacity="0.08"
            />
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="var(--color-primary)"
              fillOpacity="0.7"
            />
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="1"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: [1, 2.5, 1], opacity: [0.8, 0, 0.8] }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
                delay: node.id * 0.3,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
