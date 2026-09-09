"use client";

import { motion } from "motion/react";

export default function WhyAmbassadors() {
  return (
    <section
      id="why-ambassadors"
      className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-16">
        {/* Rail */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-6"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wide whitespace-nowrap">
            Why This Matters
          </span>
          <span
            aria-hidden="true"
            className="hidden lg:block w-px flex-1 bg-linear-to-b from-primary/40 to-transparent"
          />
        </motion.div>

        {/* Content */}
        <div className="relative max-w-2xl">
          <span
            aria-hidden="true"
            className="absolute -top-16 -left-4 text-[180px] leading-none font-serif text-primary/10 select-none"
          >
            &ldquo;
          </span>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true, margin: "-50px" }}
            className="relative space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance leading-tight">
              Somebody around you is carrying something they haven&apos;t said
              out loud.
            </h2>
            <p className="text-lg text-foreground/70 leading-relaxed text-balance">
              Maybe you&apos;ve been that person. Maybe you still are. Xolace
              exists for the moments that don&apos;t have a name yet — the
              feelings too quiet, too messy, or too heavy to put into words.
              Ambassadors help make that a little easier to say. Not by fixing
              people, not by playing therapist — just by making it normal to
              speak the true thing before it has to become a crisis.
            </p>
            <p className="border-l-4 border-primary bg-primary/5 rounded-r-xl pl-6 py-4 text-lg font-semibold text-foreground">
              That&apos;s not a marketing job. It&apos;s a human one.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
