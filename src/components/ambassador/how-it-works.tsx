"use client";

import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

const steps = [
  {
    number: "01",
    title: "Apply",
    description:
      "Tell us who you are and why Xolace matters to you. No 20-question forms — just the essentials.",
  },
  {
    number: "02",
    title: "Get Accepted",
    description: "We look for care, not credentials. If it's a fit, you're in.",
  },
  {
    number: "03",
    title: "Get Trained",
    description:
      "A short onboarding covers what Xolace is, what ambassadors actually do, and the safety & ethics every ambassador follows.",
  },
  {
    number: "04",
    title: "Choose Your Path",
    description:
      "Pick the track that fits how you already show up — Creator, Community, Growth, Creative, Production, or Advocacy.",
  },
  {
    number: "05",
    title: "Complete Missions",
    description:
      "Take on real, hands-on missions instead of guessing what to do next.",
  },
  {
    number: "06",
    title: "Grow With Xolace",
    description:
      "Build skills, gain access, and grow into new roles as you keep contributing.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20"
    >
      <div className="max-w-4xl mx-auto space-y-14">
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

        <motion.ol
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="relative max-w-2xl"
        >
          <div
            aria-hidden="true"
            className="absolute left-6 top-2 bottom-2 w-px bg-border hidden sm:block"
          />
          {steps.map((step, index) => (
            <motion.li
              key={step.number}
              variants={itemVariants}
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
