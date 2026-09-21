"use client";

import { motion } from "motion/react";
import LiveEmpathyGraph from "@/components/ui/live-empathy-graph";

export default function EmpathyGraphSection() {
  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-extrabold text-primary uppercase tracking-wider bg-primary/10 px-3.5 py-1 rounded-full">
            Real-Time Community Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Active Campus Advocate Network
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Explore live ambassador hubs and peer connections active across Ghana campuses.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <LiveEmpathyGraph />
        </motion.div>
      </div>
    </section>
  );
}
