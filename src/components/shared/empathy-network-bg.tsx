"use client";

import { motion } from "motion/react";

export default function EmpathyNetworkBg({
  className = "",
}: {
  className?: string;
}) {
  const connectionNodes = [
    { id: 1, x: 100, y: 80, label: "Listen" },
    { id: 2, x: 320, y: 160, label: "Share" },
    { id: 3, x: 220, y: 340, label: "Support" },
    { id: 4, x: 560, y: 100, label: "Care" },
    { id: 5, x: 740, y: 240, label: "Belong" },
    { id: 6, x: 960, y: 140, label: "Heard" },
    { id: 7, x: 1080, y: 320, label: "Empathy" },
    { id: 8, x: 440, y: 300, label: "Community" },
    { id: 9, x: 800, y: 380, label: "Safe Space" },
  ];

  const connections = [
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

  // Looked up by id rather than `find(...)!`, so a typo in `connections` skips
  // the edge instead of throwing during render.
  const nodesById = new Map(connectionNodes.map((n) => [n.id, n]));

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-25 ${className}`}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 480"
        preserveAspectRatio="none"
        fill="none"
        role="presentation"
      >
        {connections.map((conn, index) => {
          const fromNode = nodesById.get(conn.from);
          const toNode = nodesById.get(conn.to);

          if (!fromNode || !toNode) {
            return null;
          }

          return (
            <g key={`${conn.from}-${conn.to}`}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="var(--color-primary)"
                strokeOpacity="0.4"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />

              <motion.circle
                r="3"
                fill="var(--color-primary)"
                initial={{
                  cx: fromNode.x,
                  cy: fromNode.y,
                  opacity: 0.3,
                }}
                animate={{
                  cx: [fromNode.x, toNode.x, fromNode.x],
                  cy: [fromNode.y, toNode.y, fromNode.y],
                  opacity: [0.3, 0.9, 0.3],
                }}
                transition={{
                  duration: 5 + (index % 3) * 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: index * 0.5,
                }}
              />
            </g>
          );
        })}

        {connectionNodes.map((node) => (
          <g key={node.id}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="14"
              fill="var(--color-primary)"
              fillOpacity="0.06"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: node.id * 0.3,
              }}
            />

            <circle
              cx={node.x}
              cy={node.y}
              r="4"
              fill="var(--color-primary)"
              fillOpacity="0.8"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
