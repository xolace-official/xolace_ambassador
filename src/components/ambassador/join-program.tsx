"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Check } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/utils/supabase/client";
import { Coolshape } from "coolshapes-react";

export default function JoinProgramForm() {
  // initialize supabase client
  const supabase = getSupabaseBrowserClient();

  const [formData, setFormData] = useState({ name: "", email: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let avatar_url: string | null = null;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("ambassador-avatars")
          .upload(path, avatarFile);
        if (uploadError) throw uploadError;
        avatar_url = supabase.storage
          .from("ambassador-avatars")
          .getPublicUrl(path).data.publicUrl;
      }

      const { error: ambassadorsError } = await supabase
        .from("ambassadors")
        .insert({ name: formData.name, email: formData.email, avatar_url });

      if (ambassadorsError) throw ambassadorsError;

      setSubmitted(true);
      setIsLoading(false);

      setTimeout(() => {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setFormData({ name: "", email: "" });
        setAvatarFile(null);
        setAvatarPreview(null);
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(true);
      setIsLoading(false);
      setTimeout(() => setError(false), 3000);
    }
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
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Make a Difference?
            </h2>
            <p className="text-foreground/60 text-balance">
              Join hundreds of ambassadors already supporting Xolace's mission.
            </p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Card className="p-8 bg-card border border-border/40">
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
                      You will receive an email within a few hours for next
                      steps. Welcome to the Xolace family.
                    </p>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/20"
                  >
                    <Coolshape type="triangle" index={9} size={100} noise />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      Something went wrong
                    </h3>
                    <p className="text-sm text-foreground/60">
                      Please check your connection and try again, or email us at
                      ambassadors@xolaceinc.com.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Avatar Upload */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="flex flex-col items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-20 h-20 rounded-full border-2 border-dashed border-border/60 hover:border-primary transition-colors overflow-hidden bg-muted group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Upload profile photo"
                    >
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt="Profile preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex flex-col items-center justify-center w-full h-full gap-1 text-foreground/40 group-hover:text-primary transition-colors">
                          <Camera className="w-6 h-6" />
                          <span className="text-[10px] font-medium">Photo</span>
                        </span>
                      )}
                      {avatarPreview && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-5 h-5 text-white" />
                        </span>
                      )}
                    </button>
                    <span className="text-xs text-foreground/50">
                      Optional — JPG, PNG or WebP, max 5 MB
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={handleAvatarChange}
                    />
                  </motion.div>

                  {/* Name Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="space-y-2"
                  >
                    <label
                      htmlFor="full-name"
                      className="text-sm font-medium text-foreground"
                    >
                      Full Name
                    </label>
                    <Input
                      id="full-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name…"
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
                      autoComplete="email"
                      spellCheck={false}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com…"
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
                      className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-[background-color,transform,opacity] duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                    >
                      {isLoading ? "Joining…" : "Join the Program"}
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
