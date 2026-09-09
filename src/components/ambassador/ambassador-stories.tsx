"use client";

import { ArrowRight } from "lucide-react";
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
    strip: "from-primary to-primary/70",
  },
  {
    name: "Ambassador Name",
    track: "Community",
    quote:
      "Add their story — why they joined and what they've been working on.",
    strip: "from-accent to-accent/70",
  },
  {
    name: "Ambassador Name",
    track: "Advocacy",
    quote:
      "Add their story — why they joined and what they've been working on.",
    strip: "from-foreground to-foreground/75",
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
          className="grid grid-cols-1 md:grid-cols-3 gap-7"
        >
          {stories.map((story, index) => (
            <motion.div
              // biome-ignore lint/suspicious/noArrayIndexKey: placeholder data, no stable id yet
              key={index}
              variants={itemVariants}
              className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-[box-shadow,transform] duration-300"
            >
              <div className={`relative h-16 bg-linear-to-br ${story.strip}`}>
                <div
                  aria-hidden="true"
                  className="absolute left-6 -bottom-8 w-16 h-16 rounded-full bg-card border-4 border-card shadow-md flex items-center justify-center font-extrabold text-primary"
                >
                  {getInitials(story.name)}
                </div>
              </div>
              <div className="pt-12 px-6 pb-6 space-y-3">
                <div>
                  <p className="font-bold text-foreground">{story.name}</p>
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wide bg-foreground/5 text-foreground/60 px-2.5 py-1 rounded-full mt-1">
                    {story.track}
                  </span>
                </div>
                <blockquote className="text-foreground/65 text-sm leading-relaxed italic">
                  {story.quote}
                </blockquote>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
