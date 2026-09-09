"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";

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
      <div className="max-w-2xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center space-y-4"
        >
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
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
        >
          <Card className="p-6 sm:p-8 bg-card border border-border/40">
            <ul className="space-y-4">
              {boundaries.map((item) => (
                <li key={item.text} className="flex items-start gap-3">
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
                  <span className="text-foreground/80 leading-relaxed">
                    <span className="font-semibold text-foreground">
                      {item.type === "never" ? "Never " : "Always "}
                    </span>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
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
