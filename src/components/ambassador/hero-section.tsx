"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useMemo } from "react";
import LiveEmpathyGraph from "@/components/ui/live-empathy-graph";
import { Button } from "@/components/ui/button";
import { OFFICIAL_AMBASSADORS } from "@/constants";

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

/** Utility to pick N random items from array */
function pickRandom<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export default function HeroSection() {
  // Pick exactly 3 random ambassadors for the overlapping circles display
  const randomThreeAmbassadors = useMemo(
    () => pickRandom(OFFICIAL_AMBASSADORS, 3),
    [],
  );

  return (
    <section className="relative w-full overflow-hidden bg-background pt-32 sm:pt-36 lg:pt-40 pb-20 lg:pb-28">
      {/* Ambient background glowing shapes */}
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-14 lg:gap-16 items-center w-full">
          {/* Left Column: Copy */}
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

            {/* Overlapping ambassador circles (3 random real ambassador photos) */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3 pt-2"
            >
              <div aria-hidden="true" className="flex -space-x-2.5">
                {randomThreeAmbassadors.map((ambassador) => (
                  <div
                    key={ambassador.id}
                    className="relative w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-muted shadow-sm"
                    title={ambassador.name}
                  >
                    <Image
                      src={ambassador.image}
                      alt={ambassador.name}
                      fill
                      sizes="32px"
                      className="object-cover object-top"
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm font-semibold text-foreground/55">
                {OFFICIAL_AMBASSADORS.length}+ ambassadors already building
                this.
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column: $3M Live Empathy Interactive Node Graph Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full"
          >
            <LiveEmpathyGraph />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
