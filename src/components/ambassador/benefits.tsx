"use client";

import { GraduationCap, KeyRound, Sparkles } from "lucide-react";
import { motion } from "motion/react";

const benefits = [
  {
    icon: Sparkles,
    title: "Personal Brand",
    hook: "Get seen for the work you actually do.",
    examples: [
      "Featured on Xolace platforms",
      "Ambassador spotlight",
      "Portfolio opportunities",
      "LinkedIn recognition",
    ],
    reverse: false,
  },
  {
    icon: GraduationCap,
    title: "Skills",
    hook: "Learn from real workshops, not a PDF.",
    examples: [
      "Storytelling",
      "Mental-health communication",
      "Community building",
      "Content & video production",
    ],
    reverse: true,
  },
  {
    icon: KeyRound,
    title: "Access",
    hook: "Get closer to the people building Xolace.",
    examples: [
      "Founder sessions",
      "Product previews & beta access",
      "Behind-the-scenes campaigns",
      "Direct work with the creative/product team",
    ],
    reverse: false,
  },
];

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function Benefits() {
  return (
    <section
      id="what-you-get"
      className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20 scroll-mt-20"
    >
      <div className="max-w-4xl mx-auto space-y-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-2xl space-y-4"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">
            What You Get
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-balance">
            Real benefits. Not just a certificate.
          </h2>
        </motion.div>

        {/* Feature rows */}
        <div>
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={rowVariants}
                className={`flex flex-col items-start gap-6 py-8 md:py-9 border-b border-border/40 last:border-b-0 md:gap-12 ${
                  benefit.reverse ? "md:flex-row-reverse" : "md:flex-row"
                } md:items-center`}
              >
                <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Icon aria-hidden="true" className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <div
                  className={benefit.reverse ? "md:text-right" : "md:text-left"}
                >
                  <h3 className="font-bold text-xl sm:text-2xl mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-foreground/70 text-sm sm:text-base leading-relaxed mb-4">
                    {benefit.hook}
                  </p>
                  <ul
                    className={`flex flex-wrap gap-2 ${
                      benefit.reverse ? "md:justify-end" : ""
                    }`}
                  >
                    {benefit.examples.map((example) => (
                      <li
                        key={example}
                        className="text-xs font-medium text-foreground/60 bg-secondary px-2.5 py-1 rounded-full"
                      >
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Opportunities statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true, margin: "-50px" }}
          className="bg-accent rounded-3xl p-8 sm:p-10"
        >
          <p className="text-2xl sm:text-3xl font-bold text-balance text-accent-foreground">
            The biggest benefit? You get to build something real.
          </p>
          <p className="text-accent-foreground/70 pt-2">
            That&apos;s worth more than a certificate.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
