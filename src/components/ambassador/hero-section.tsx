"use client";

import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-background via-background to-secondary/30 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.2 }}
          className="absolute -top-40 -right-20 w-80 h-80 rounded-full bg-background/30 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute bottom-0 -left-40 w-96 h-96 rounded-full bg-accent/15 blur-3xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl text-center space-y-8"
      >
        {/* Logo/Badge */}
        <motion.div variants={itemVariants} className="inline-block">
          <div className="px-4 py-2 rounded-full bg-secondary border border-border/50">
            <p className="text-sm font-medium text-foreground">
              Join Our Movement
            </p>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl  font-bold text-balance leading-tight">
            Become a
            <span className="block mt-2 text-primary">Xolace Ambassador</span>
          </h1>
          <p className="text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto text-balance font-light">
            Help us reach people in their moments of need. Be part of a
            community making mental health support accessible, compassionate,
            and truly transformative.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
        >
          <Button
            asChild
            size="lg"
            className="px-8 py-4 font-semibold transition-[box-shadow,transform] duration-300 hover:shadow-lg transform hover:-translate-y-1"
          >
            <a href="#signup-form">Join the Program</a>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="px-8 py-4 font-semibold transition-[border-color] duration-300 border border-border/30 hover:border-border/60"
          >
            <a href="#program-details">Learn More</a>
          </Button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="pt-12"
        >
          <ArrowDown
            aria-hidden="true"
            className="mx-auto text-primary/60 w-5 h-5"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
