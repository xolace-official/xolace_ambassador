"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

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
    transition: { duration: 0.7 },
  },
};

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* Ambient background shapes */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -top-44 -right-40 w-[640px] h-[640px] rounded-full bg-accent/20 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute -bottom-56 right-24 w-[520px] h-[520px] rounded-full bg-primary/10 blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-20 lg:pb-28 lg:min-h-[88vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.82fr] gap-14 lg:gap-16 items-center w-full">
          {/* Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start gap-6 text-left"
          >
            <motion.span
              variants={itemVariants}
              className="inline-block px-4 py-2 rounded-full bg-accent/20 text-foreground text-xs font-bold uppercase tracking-wide"
            >
              Join the Movement
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-balance"
            >
              <span className="block text-foreground">Help build a world</span>
              <span className="block text-primary">
                where people feel heard.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-foreground/70 max-w-md leading-relaxed font-medium"
            >
              Xolace Ambassadors believe emotional wellbeing shouldn&apos;t be
              something we only talk about when things get bad. You don&apos;t
              have to be an expert — you just have to care.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Button
                asChild
                size="lg"
                className="h-auto px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
              >
                <a href="#apply">Become an Ambassador</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-auto px-8 py-4 rounded-2xl font-bold border-foreground/15 bg-transparent hover:bg-secondary/60"
              >
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3 pt-2"
            >
              <div aria-hidden="true" className="flex -space-x-2.5">
                <span className="w-8 h-8 rounded-full bg-primary/25 border-2 border-background" />
                <span className="w-8 h-8 rounded-full bg-accent/40 border-2 border-background" />
                <span className="w-8 h-8 rounded-full bg-secondary border-2 border-background" />
              </div>
              <span className="text-sm font-semibold text-foreground/55">
                10+ ambassadors already building this.
              </span>
            </motion.div>
          </motion.div>

          {/* Collage — desktop */}
          <div className="hidden lg:block relative h-[440px]">
            <motion.div
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: -4 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="absolute top-2 left-2 w-[86%] bg-card border border-border/60 rounded-3xl p-8 shadow-xl"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-primary mb-3">
                Xolace
              </p>
              <p className="text-2xl font-bold leading-snug text-foreground">
                &ldquo;You&apos;re not the only one carrying this.&rdquo;
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: 3 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="absolute top-[210px] right-0 w-[78%] bg-accent/25 rounded-3xl p-8 shadow-lg"
            >
              <p className="text-xl font-bold leading-snug text-foreground">
                &ldquo;A quiet place to be human.&rdquo;
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: -2 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="absolute bottom-2 left-8 w-[68%] bg-primary rounded-3xl p-7 shadow-xl shadow-primary/30"
            >
              <p className="text-lg font-bold leading-snug text-primary-foreground">
                &ldquo;For the moments that don&apos;t have a name yet.&rdquo;
              </p>
            </motion.div>
          </div>

          {/* Collage — mobile/tablet (same content, simplified to a stack) */}
          <div className="flex lg:hidden flex-col gap-4 w-full">
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-primary mb-2">
                Xolace
              </p>
              <p className="text-lg font-bold leading-snug text-foreground">
                &ldquo;You&apos;re not the only one carrying this.&rdquo;
              </p>
            </div>
            <div className="bg-accent/25 rounded-2xl p-6">
              <p className="text-base font-bold leading-snug text-foreground">
                &ldquo;A quiet place to be human.&rdquo;
              </p>
            </div>
            <div className="bg-primary rounded-2xl p-6">
              <p className="text-base font-bold leading-snug text-primary-foreground">
                &ldquo;For the moments that don&apos;t have a name yet.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
