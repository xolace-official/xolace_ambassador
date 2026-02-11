"use client";

import { Mail } from "lucide-react";
import { motion } from "motion/react";

const AnimatedCta = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Want to Join Our Ambassador Program?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Be part of a global movement making mental health support accessible
            to everyone.
          </p>
          <a
            href="mailto:ambassadors@xolaceinc.com"
            className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-4 rounded-xl font-semibold hover:bg-background/90 transition-[color,background-color,box-shadow] duration-300 shadow-lg hover:shadow-xl"
          >
            <Mail aria-hidden="true" className="w-5 h-5" />
            Contact Us to Apply
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default AnimatedCta;
