"use client";

import { Activity, MapPin, Radio, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface CampusNode {
  id: string;
  name: string;
  region: string;
  activeAmbassadors: number;
  sessionsToday: number;
  xPct: number;
  yPct: number;
}

const campusNodes: CampusNode[] = [
  {
    id: "legon",
    name: "UG Legon",
    region: "Accra",
    activeAmbassadors: 8,
    sessionsToday: 34,
    xPct: 20,
    yPct: 35,
  },
  {
    id: "koforidua",
    name: "KTU Koforidua",
    region: "Eastern Region",
    activeAmbassadors: 6,
    sessionsToday: 28,
    xPct: 45,
    yPct: 22,
  },
  {
    id: "knust",
    name: "KNUST",
    region: "Kumasi",
    activeAmbassadors: 10,
    sessionsToday: 42,
    xPct: 70,
    yPct: 40,
  },
  {
    id: "ucc",
    name: "UCC Cape Coast",
    region: "Central Region",
    activeAmbassadors: 5,
    sessionsToday: 19,
    xPct: 35,
    yPct: 72,
  },
  {
    id: "upsa",
    name: "UPSA",
    region: "Accra",
    activeAmbassadors: 4,
    sessionsToday: 15,
    xPct: 80,
    yPct: 75,
  },
];

export default function LiveEmpathyGraph() {
  const [selectedNode, setSelectedNode] = useState<CampusNode>(campusNodes[0]);

  return (
    <div className="w-full bg-card/80 border border-border/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
            <Radio aria-hidden="true" className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-foreground leading-snug">
              Live Empathy Network
            </h3>
            <p className="text-xs text-muted-foreground">
              Interactive peer advocate nodes active on campus
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          Active Live Graph
        </div>
      </div>

      {/* Interactive Map Visual */}
      <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl bg-secondary/30 border border-border/40 overflow-hidden">
        {/* Subtle grid lines background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none"
        />

        {/* Connecting SVG beams */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {campusNodes.map((from, idx) => {
            const next = campusNodes[(idx + 1) % campusNodes.length];
            return (
              <g key={`${from.id}-${next.id}`}>
                <line
                  x1={`${from.xPct}%`}
                  y1={`${from.yPct}%`}
                  x2={`${next.xPct}%`}
                  y2={`${next.yPct}%`}
                  stroke="var(--color-primary)"
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />
              </g>
            );
          })}
        </svg>

        {/* Interactive Nodes */}
        {campusNodes.map((node) => {
          const isSelected = selectedNode.id === node.id;
          return (
            <motion.button
              key={node.id}
              type="button"
              onClick={() => setSelectedNode(node)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group focus-visible:outline-none cursor-pointer"
              style={{ left: `${node.xPct}%`, top: `${node.yPct}%` }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative flex items-center justify-center">
                {/* Ripple ring */}
                <span
                  className={`absolute w-10 h-10 rounded-full transition-all duration-300 ${
                    isSelected
                      ? "bg-primary/30 animate-ping opacity-75"
                      : "bg-primary/10 group-hover:bg-primary/20"
                  }`}
                />
                {/* Core dot badge */}
                <div
                  className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-background shadow-lg shadow-primary/40"
                      : "bg-card text-foreground border-primary/40 group-hover:border-primary"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Tooltip Label */}
              <span
                className={`absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-md transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground opacity-100"
                    : "bg-card text-foreground border border-border/60 opacity-80 group-hover:opacity-100"
                }`}
              >
                {node.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Node Details Card */}
      <motion.div
        key={selectedNode.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/50"
      >
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Campus Hub
          </p>
          <p className="font-extrabold text-base text-foreground">
            {selectedNode.name}
          </p>
          <p className="text-xs text-primary font-semibold">
            {selectedNode.region}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
            <Users className="w-3.5 h-3.5 text-primary" /> Active Advocates
          </div>
          <p className="text-xl font-black text-foreground">
            {selectedNode.activeAmbassadors}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              Ambassadors
            </span>
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
            <Activity className="w-3.5 h-3.5 text-accent" /> Peer Connections
          </div>
          <p className="text-xl font-black text-foreground">
            {selectedNode.sessionsToday}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              Conversations
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
