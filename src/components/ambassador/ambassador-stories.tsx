"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

// Placeholder — swap for real ambassador names, tracks, and quotes
const stories = [
  {
    name: "Ambassador Name",
    track: "Creator",
    quote:
      "Add their story — why they joined and what they've been working on.",
  },
  {
    name: "Ambassador Name",
    track: "Community",
    quote:
      "Add their story — why they joined and what they've been working on.",
  },
  {
    name: "Ambassador Name",
    track: "Advocacy",
    quote:
      "Add their story — why they joined and what they've been working on.",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AmbassadorStories() {
  return (
    <section
      id="stories"
      className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto space-y-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-2xl space-y-4"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wide">
              Meet the Ambassadors
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-balance">
              Real people. Real reasons for showing up.
            </h2>
          </motion.div>

          <motion.a
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-50px" }}
            href="/ambassadors"
            className="inline-flex items-center gap-2 shrink-0 font-semibold text-primary hover:gap-3 transition-[gap] duration-300"
          >
            Meet all our ambassadors
            <ArrowRight aria-hidden="true" className="w-4 h-4" />
          </motion.a>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {stories.map((story, index) => (
            <motion.div
              // biome-ignore lint/suspicious/noArrayIndexKey: placeholder data, no stable id yet
              key={index}
              variants={itemVariants}
            >
              <Card className="h-full p-6 bg-card border border-border/30 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-[border-color,box-shadow,transform] duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    aria-hidden="true"
                    className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0"
                  >
                    {getInitials(story.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {story.name}
                    </p>
                    <p className="text-xs font-medium text-foreground/60">
                      {story.track} Ambassador
                    </p>
                  </div>
                </div>
                <blockquote className="text-foreground/70 text-sm leading-relaxed italic">
                  {story.quote}
                </blockquote>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
