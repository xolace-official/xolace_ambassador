"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function JoinProgramForm() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    setIsLoading(false);

    // Reset form after 2 seconds
    setTimeout(() => {
      setFormData({ name: "", email: "" });
      setSubmitted(false);
    }, 2000);
  };

  return (
    <section
      id="signup-form"
      className="w-full py-20 px-2 sm:px-6 lg:px-8 bg-background scroll-mt-20"
    >
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold">
              Ready to Make a Difference?
            </h2>
            <p className="text-foreground/60 text-balance">
              Join thousands of ambassadors already supporting Xolace's mission.
            </p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Card className="p-8 bg-white border border-border/40">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20"
                  >
                    <Check className="w-8 h-8 text-accent" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      You're In!
                    </h3>
                    <p className="text-sm text-foreground/60">
                      Check your email for next steps. Welcome to the Xolace
                      family.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="space-y-2"
                  >
                    {/** biome-ignore lint/a11y/noLabelWithoutControl: well */}
                    <label className="text-sm font-medium text-foreground">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="bg-background border border-border/50 rounded-lg placeholder:text-foreground/40"
                    />
                  </motion.div>

                  {/* Email Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="space-y-2"
                  >
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      className="bg-background border border-border/50 rounded-lg placeholder:text-foreground/40"
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                    >
                      {isLoading ? "Joining..." : "Join the Program"}
                    </button>
                  </motion.div>

                  <p className="text-xs text-foreground/50 text-center">
                    We respect your privacy. No spam, ever.
                  </p>
                </form>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
