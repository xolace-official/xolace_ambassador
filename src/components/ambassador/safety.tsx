"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const boundaries = [
  { type: "never", text: "Diagnose or act as a therapist." },
  {
    type: "never",
    text: "Promise confidentiality outside Xolace's actual systems.",
  },
  { type: "never", text: "Pressure anyone to disclose personal information." },
  { type: "never", text: "Exploit someone's vulnerable moment for content." },
  {
    type: "never",
    text: "Fabricate testimonials or use someone's story without permission.",
  },
  {
    type: "always",
    text: "Know when to point someone toward real professional or emergency support.",
  },
] as const;

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
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {boundaries.map((item) => (
            <motion.div key={item.text} variants={itemVariants}>
              <Card className="h-full flex items-start gap-3 p-5 bg-card border border-border/40">
                {item.type === "never" ? (
                  <XCircle
                    aria-hidden="true"
                    className="w-5 h-5 text-destructive shrink-0 mt-0.5"
                  />
                ) : (
                  <CheckCircle2
                    aria-hidden="true"
                    className="w-5 h-5 text-primary shrink-0 mt-0.5"
                  />
                )}
                <span className="text-foreground/80 leading-relaxed text-sm">
                  <span className="font-bold text-foreground">
                    {item.type === "never" ? "Never " : "Always "}
                  </span>
                  {item.text}
                </span>
              </Card>
            </motion.div>
          ))}
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
