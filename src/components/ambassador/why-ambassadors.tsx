"use client";

import { motion } from "motion/react";

export default function WhyAmbassadors() {
  return (
    <section
      id="why-ambassadors"
      className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-3xl mx-auto text-center space-y-6"
      >
        <p className="text-sm font-medium text-primary uppercase tracking-wide">
          Why This Matters
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance leading-tight">
          Somebody around you is carrying something they haven&apos;t said out
          loud.
        </h2>
        <p className="text-lg text-foreground/70 leading-relaxed text-balance">
          Maybe you&apos;ve been that person. Maybe you still are. Xolace exists
          for the moments that don&apos;t have a name yet — the feelings too
          quiet, too messy, or too heavy to put into words. Ambassadors help
          make that a little easier to say. Not by fixing people, not by playing
          therapist — just by making it normal to speak the true thing before it
          has to become a crisis.
        </p>
        <p className="text-base font-semibold text-foreground pt-2">
          That&apos;s not a marketing job. It&apos;s a human one.
        </p>
      </motion.div>
    </section>
  );
}
