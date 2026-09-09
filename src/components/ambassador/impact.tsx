"use client";

import { motion } from "motion/react";
import { STATS } from "@/constants";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Impact() {
  return (
    <section
      id="impact"
      className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20 scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-2xl space-y-4"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">
            Your Impact
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-balance">
            Still early. Already real.
          </h2>
          <p className="text-lg text-foreground/60 text-balance">
            These are actual numbers, not projections — and they grow with every
            ambassador who joins.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-4 bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm"
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className={`p-6 sm:p-8 text-center space-y-2 ${
                index !== 0 ? "border-t sm:border-t-0 sm:border-l" : ""
              } border-border/40`}
            >
              <stat.icon
                aria-hidden="true"
                className="w-6 h-6 mx-auto text-primary"
              />
              <div className="text-3xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-foreground/60">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
