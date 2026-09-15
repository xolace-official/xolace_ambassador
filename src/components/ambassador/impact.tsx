"use client";

import { motion } from "motion/react";
import { STATS } from "@/constants";

const positions = [
  { leftPct: 1.6, topPct: 9.4, widthPct: 16.1, rotate: -6 },
  { leftPct: 22.6, topPct: 0, widthPct: 16.1, rotate: 4 },
  { leftPct: 43.5, topPct: 12.5, widthPct: 16.1, rotate: -3 },
  { leftPct: 64.5, topPct: 3.1, widthPct: 16.1, rotate: 7 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, rotate: 0 },
  visible: (rotate: number) => ({
    opacity: 1,
    y: 0,
    rotate,
    transition: { duration: 0.5 },
  }),
};

export default function Impact() {
  return (
    <section
      id="impact"
      className="w-full pt-20 px-4 sm:px-6 lg:px-8 bg-secondary/20 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto space-t-16 ">
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
          <h2 className="text-4xl sm:text-5xl font-bold md:text-balance">
            Still early. Already real.
          </h2>
          <p className="text-lg text-foreground/60 md:text-balance pb-8">
            These are actual numbers, not projections — and they grow with every
            ambassador who joins.
          </p>
        </motion.div>

        {/* Desktop/tablet: scattered polaroid composition */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="hidden lg:block relative aspect-[1240/320]"
        >
          {STATS.map((stat, index) => {
            const pos = positions[index];
            return (
              <motion.div
                key={stat.label}
                custom={pos.rotate}
                variants={itemVariants}
                className="absolute bg-card rounded-md shadow-xl p-3 pb-4"
                style={{
                  left: `${pos.leftPct}%`,
                  top: `${pos.topPct}%`,
                  width: `${pos.widthPct}%`,
                }}
              >
                <div className="bg-primary/8 rounded-sm aspect-[3/2] flex flex-col items-center justify-center gap-1.5">
                  <stat.icon
                    aria-hidden="true"
                    className="w-6 h-6 text-primary"
                  />
                  <span className="text-2xl font-extrabold text-foreground">
                    {stat.value}
                  </span>
                </div>
                <p className="mt-3 text-center text-[11px] font-bold text-foreground/70">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mobile/tablet: same card style, plain grid — no horizontal scroll */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 gap-4 lg:hidden"
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              custom={0}
              className="bg-card rounded-md shadow-md p-3 pb-4"
            >
              <div className="bg-primary/8 rounded-sm aspect-[3/2] flex flex-col items-center justify-center gap-1.5">
                <stat.icon
                  aria-hidden="true"
                  className="w-6 h-6 text-primary"
                />
                <span className="text-2xl font-extrabold text-foreground">
                  {stat.value}
                </span>
              </div>
              <p className="mt-3 text-center text-[11px] font-bold text-foreground/70">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
