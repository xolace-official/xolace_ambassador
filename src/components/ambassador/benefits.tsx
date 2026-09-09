"use client";

import { GraduationCap, KeyRound, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";

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
    transition: { duration: 0.6 },
  },
};

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
  },
];

export default function Benefits() {
  return (
    <section
      id="what-you-get"
      className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center space-y-4"
        >
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            What You Get
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-balance">
            Real benefits. Not just a certificate.
          </h2>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div key={benefit.title} variants={itemVariants}>
                <Card className="h-full p-6 bg-linear-to-br from-secondary/40 to-secondary/20 border border-border/20 hover:border-accent/40 transition-[border-color,box-shadow] duration-300 hover:shadow-lg">
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/20">
                      <Icon
                        aria-hidden="true"
                        className="w-6 h-6 text-accent"
                      />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">
                      {benefit.hook}
                    </p>
                    <ul className="flex flex-wrap gap-2 pt-1">
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
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Opportunities statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center pt-4"
        >
          <p className="text-2xl sm:text-3xl font-bold text-balance">
            The biggest benefit? You get to build something real.
          </p>
          <p className="text-foreground/60 pt-2">
            That&apos;s worth more than a certificate.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
