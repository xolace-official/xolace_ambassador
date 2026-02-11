"use client";

import { Heart, Mail } from "lucide-react";
import { motion } from "motion/react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-foreground text-primary-foreground py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-xl font-serif font-bold">Xolace</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              Creating pathways to mental health support before crisis, between
              sessions, and beyond clinical care.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    document
                      .getElementById("signup-form")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-primary-foreground transition-colors"
                >
                  Apply Now
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    document
                      .getElementById("program-details")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-primary-foreground transition-colors"
                >
                  Program Details
                </button>
              </li>
              <li>
                <span className="text-primary-foreground/40 cursor-default">
                  FAQs
                </span>
              </li>
              <li>
                <span className="text-primary-foreground/40 cursor-default">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Contact Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="font-semibold">Get in Touch</h4>
            <a
              href="mailto:ambassadors@xolaceinc.com"
              className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              <Mail aria-hidden="true" className="w-4 h-4" />
              ambassadors@xolaceinc.com
            </a>
            <p className="text-xs text-primary-foreground/60">
              Questions? We'd love to hear from you.
            </p>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/20 my-8" />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60"
        >
          <p suppressHydrationWarning>
            © {currentYear} Xolace. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            Made with
            <Heart aria-hidden="true" className="w-4 h-4 text-primary" />
            for mental health
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
