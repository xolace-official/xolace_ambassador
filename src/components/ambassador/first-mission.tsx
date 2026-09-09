"use client";

import { Lock } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function FirstMission() {
  return (
    <section
      id="first-mission"
      className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20"
    >
      <div className="max-w-xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center space-y-4"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">
            Your First Mission
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
            Here&apos;s the kind of thing you&apos;ll actually do.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true, margin: "-50px" }}
          className="relative"
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 z-10">
            <Lock
              aria-hidden="true"
              className="w-5 h-5 text-primary-foreground"
            />
          </div>

          <Card className="bg-[oklch(0.1649_0.0352_281.8285)] text-white border-0 rounded-3xl p-9 pt-10 text-center space-y-4">
            <p className="text-xs font-bold uppercase tracking-wide text-accent">
              Mission 01 — Locked Preview
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-balance">
              Start a conversation about something people don&apos;t usually
              talk about.
            </h3>
            <p className="text-white/65 leading-relaxed max-w-md mx-auto">
              Ask someone you know a question that goes beneath the surface.
              Listen without trying to fix anything. Then tell us what you
              noticed.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <span className="text-xs font-semibold text-white/50 bg-white/10 px-3 py-1.5 rounded-full">
                ~15 minutes
              </span>
              <span className="text-xs font-semibold text-white/50 bg-white/10 px-3 py-1.5 rounded-full">
                Any track
              </span>
              <span className="text-xs font-semibold text-white/50 bg-white/10 px-3 py-1.5 rounded-full">
                No experience required
              </span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center space-y-4"
        >
          <p className="text-sm text-foreground/60">
            This is just the first one. More unlock as you go.
          </p>
          <Button asChild size="lg" className="font-semibold">
            <a href="#apply">Become an Ambassador to Unlock It</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
