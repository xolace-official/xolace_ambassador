"use client";

import { Check, XCircle } from "lucide-react";
import { motion } from "motion/react";

const neverItems = [
  "Diagnose or act as a therapist.",
  "Promise confidentiality outside Xolace's actual systems.",
  "Pressure anyone to disclose personal information.",
  "Exploit someone's vulnerable moment for content.",
  "Fabricate testimonials or use someone's story without permission.",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export default function Safety() {
  return (
    <section
      id="safety"
      className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20 scroll-mt-20"
    >
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-2xl space-y-4"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">
            Safety & Responsibility
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
            Care for people. Never play therapist.
          </h2>
          <p className="text-lg text-foreground/60 text-balance">
            Xolace deals with something sensitive, and every ambassador agrees
            to a few non-negotiables before they start.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] rounded-3xl overflow-hidden border border-border/40"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="bg-card p-8 sm:p-9 space-y-5"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-destructive">
              Never
            </p>
            {neverItems.map((item) => (
              <motion.div
                key={item}
                variants={itemVariants}
                className="flex items-start gap-3"
              >
                <XCircle
                  aria-hidden="true"
                  className="w-[18px] h-[18px] text-destructive shrink-0 mt-0.5"
                />
                <span className="text-foreground/80 text-sm leading-relaxed">
                  {item}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <div className="bg-accent p-8 sm:p-9 flex flex-col justify-center gap-4">
            <p className="text-xs font-bold uppercase tracking-wide text-accent-foreground/70">
              Always
            </p>
            <Check
              aria-hidden="true"
              className="w-8 h-8 text-accent-foreground"
            />
            <p className="text-lg font-bold leading-relaxed text-accent-foreground">
              Know when to point someone toward real professional or emergency
              support.
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center font-semibold text-foreground"
        >
          This isn&apos;t a footnote — it&apos;s mandatory onboarding for every
          ambassador.
        </motion.p>
      </div>
    </section>
  );
}
