"use client";

import { motion } from "motion/react";
import Image from "next/image";

export default function WhyAmbassadors() {
  return (
    <section
      id="why-ambassadors"
      className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column: Concise Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-6"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wide">
            Why This Matters
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-foreground md:text-balance">
            Somebody around you is carrying something unspoken.
          </h2>

          <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
            Xolace creates safe spaces for the feelings too quiet or heavy to
            put into words — making it normal to speak the true thing before it
            becomes a crisis.
          </p>

          <div className="border-l-4 border-primary bg-primary/5 rounded-r-2xl p-4 sm:p-5 text-base sm:text-lg font-semibold text-foreground">
            &ldquo;That&apos;s not a marketing job. It&apos;s a human
            one.&rdquo;
          </div>
        </motion.div>

        {/* Right Column: Visual Image Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-50px" }}
          className="relative rounded-3xl overflow-hidden bg-secondary/30 p-2 sm:p-3 border border-border/50 shadow-xl"
        >
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-card">
            <Image
              src="/why-ambassadors.png"
              alt="People connecting and having an empathetic conversation"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
              priority
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
