"use client";

import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Apply",
    description: "Share who you are and why Xolace matters. Quick & essential.",
  },
  {
    number: "02",
    title: "Get Accepted",
    description: "We look for heart, not credentials. If it fits, you're in.",
  },
  {
    number: "03",
    title: "Get Trained",
    description: "Short onboarding covering your role, safety, and ethics.",
  },
  {
    number: "04",
    title: "Choose Your Path",
    description: "Pick the track matching how you already show up.",
  },
  {
    number: "05",
    title: "Complete Missions",
    description: "Take on real hands-on tasks with clear guidance.",
  },
  {
    number: "06",
    title: "Grow With Xolace",
    description: "Build skills, gain access, and expand your impact.",
  },
];

// Station positions along the winding path, as a % of the 1180-wide
// viewBox and a fixed px height — mirrors the path's control points below.
const stationPositions = [
  { xPct: 5.76, topPx: 70 },
  { xPct: 23.73, topPx: 10 },
  { xPct: 41.69, topPx: 90 },
  { xPct: 59.66, topPx: 0 },
  { xPct: 77.63, topPx: 100 },
  { xPct: 95.59, topPx: 30 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative w-full py-20 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 overflow-hidden"
    >
      {/* Subtle organic background grid / accent for Senior UI feel */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.25] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-2xl space-y-4"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
            From curious to contributing — in six steps.
          </h2>
        </motion.div>

        {/* Desktop: winding path with stations */}
        <div className="hidden lg:block">
          <div className="relative w-full h-[156px]">
            <svg
              aria-hidden="true"
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1180 156"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M68,98 C138.7,98 209.3,38 280,38 C350.7,38 421.3,118 492,118 C562.7,118 633.3,28 704,28 C774.7,28 845.3,128 916,128 C986.7,128 1057.3,58 1128,58"
                stroke="var(--color-primary)"
                strokeOpacity="0.3"
                strokeWidth="3"
                strokeDasharray="2 12"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  aria-hidden="true"
                  variants={itemVariants}
                  className="absolute w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-sm shadow-lg shadow-primary/40"
                  style={{
                    left: `calc(${stationPositions[index].xPct}% - 28px)`,
                    top: stationPositions[index].topPx,
                  }}
                >
                  {step.number}
                </motion.div>
              ))}
            </motion.div>
          </div>

          <ol className="grid grid-cols-6 gap-x-5 mt-6">
            {steps.map((step) => (
              <li key={step.number}>
                <h3 className="font-bold text-base mb-2">{step.title}</h3>
                <p className="text-foreground/60 text-sm leading-relaxed">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Mobile/tablet: vertical stepper */}
        <motion.ol
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="relative max-w-2xl lg:hidden"
        >
          <div
            aria-hidden="true"
            className="absolute left-6 top-2 bottom-2 w-px bg-border hidden sm:block"
          />
          {steps.map((step, index) => (
            <motion.li
              key={step.number}
              variants={mobileItemVariants}
              className={`relative flex gap-6 sm:gap-8 ${
                index < steps.length - 1 ? "pb-10" : ""
              }`}
            >
              <div className="relative z-10 shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                {step.number}
              </div>
              <div className="pt-2 space-y-1.5">
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-foreground/60 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
