"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../../../../convex/_generated/api";

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters.").max(120),
  email: z.email({ error: "Enter a valid email address." }),
  location: z.string().trim().min(2, "Enter your city and country.").max(120),
  schoolOrCommunity: z.string().max(160),
  socialPlatform: z.string().max(80),
  socialHandle: z.string().max(100),
  track: z.enum(
    ["creator", "community", "growth", "creative", "production", "advocacy"],
    {
      error: "Choose a track.",
    },
  ),
  whyXolace: z
    .string()
    .trim()
    .min(20, "Write at least 20 characters.")
    .max(4000),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

const TRACKS = [
  "creator",
  "community",
  "growth",
  "creative",
  "production",
  "advocacy",
] as const;
const SOCIAL_PLATFORMS = [
  "LinkedIn",
  "X",
  "TikTok",
  "Instagram",
  "Reddit",
] as const;
const initialFormData: ApplicationForm = {
  name: "",
  email: "",
  location: "",
  schoolOrCommunity: "",
  socialPlatform: "",
  socialHandle: "",
  track: "creator",
  whyXolace: "",
};

const reassurances = [
  "We read every application — no bots, no filters.",
  "You’ll hear back within a few days, either way.",
  "Onboarding starts right after — no waiting around.",
];

export default function JoinProgramForm() {
  const submitApplication = useMutation(api.applications.submit);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: initialFormData,
  });

  async function onSubmit(values: ApplicationForm) {
    setError(null);
    try {
      await submitApplication({
        name: values.name,
        email: values.email,
        location: values.location,
        school: values.schoolOrCommunity || undefined,
        socialPlatform: values.socialPlatform || undefined,
        socialHandle: values.socialHandle || undefined,
        trackInterest: values.track,
        whyXolace: values.whyXolace,
      });
      setSubmitted(true);
      reset(initialFormData);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not submit your application. Please try again.",
      );
    }
  }

  return (
    <section
      id="apply"
      className="relative w-full overflow-hidden bg-background px-4 py-20 scroll-mt-20 sm:px-6 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 size-[500px] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-8 lg:pt-6"
        >
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              Ready?
            </p>
            <h2 className="text-3xl font-bold md:text-balance sm:text-4xl">
              You don’t have to be an expert. You just have to care.
            </h2>
          </div>
          <div className="space-y-4">
            {reassurances.map((text, index) => (
              <div key={text} className="flex items-start gap-3.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed text-foreground/70">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <Card className="rounded-3xl border border-border/40 bg-card p-6 shadow-xl sm:p-8">
            {submitted ? (
              <div aria-live="polite" className="space-y-4 py-6 text-center">
                <span className="inline-flex size-16 items-center justify-center rounded-full bg-accent/20">
                  <Check aria-hidden="true" className="size-8 text-accent" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    Application received
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Thanks for applying. Our team will review your details and
                    follow up.
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => setSubmitted(false)}
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    id="full-name"
                    error={errors.name?.message}
                  >
                    {(fieldProps) => (
                      <Input
                        id="full-name"
                        autoComplete="name"
                        placeholder="Your name…"
                        {...fieldProps}
                        {...register("name")}
                      />
                    )}
                  </Field>
                  <Field
                    label="Email address"
                    id="email"
                    error={errors.email?.message}
                  >
                    {(fieldProps) => (
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        spellCheck={false}
                        placeholder="you@example.com…"
                        {...fieldProps}
                        {...register("email")}
                      />
                    )}
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Location"
                    id="location"
                    error={errors.location?.message}
                  >
                    {(fieldProps) => (
                      <Input
                        id="location"
                        autoComplete="address-level2"
                        placeholder="City, country…"
                        {...fieldProps}
                        {...register("location")}
                      />
                    )}
                  </Field>
                  <Field
                    label="School / Community (optional)"
                    id="school-or-community"
                    error={errors.schoolOrCommunity?.message}
                  >
                    {(fieldProps) => (
                      <Input
                        id="school-or-community"
                        placeholder="Your school or community…"
                        {...fieldProps}
                        {...register("schoolOrCommunity")}
                      />
                    )}
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="social-platform"
                      className="text-sm font-medium"
                    >
                      Social handle (optional)
                    </label>
                    <div className="flex gap-2">
                      <Controller
                        control={control}
                        name="socialPlatform"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              id="social-platform"
                              className="w-32 shrink-0"
                            >
                              <SelectValue placeholder="Platform" />
                            </SelectTrigger>
                            <SelectContent>
                              {SOCIAL_PLATFORMS.map((platform) => (
                                <SelectItem key={platform} value={platform}>
                                  {platform}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Input
                        aria-label="Social handle"
                        placeholder="Your handle…"
                        {...register("socialHandle")}
                      />
                    </div>
                    <FieldError
                      id="social-handle-error"
                      message={errors.socialHandle?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="track" className="text-sm font-medium">
                      Track
                    </label>
                    <Controller
                      control={control}
                      name="track"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="track" className="w-full">
                            <SelectValue placeholder="Select a track…" />
                          </SelectTrigger>
                          <SelectContent>
                            {TRACKS.map((track) => (
                              <SelectItem
                                key={track}
                                value={track}
                                className="capitalize"
                              >
                                {track}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError
                      id="track-error"
                      message={errors.track?.message}
                    />
                  </div>
                </div>
                <Field
                  label="Why Xolace?"
                  id="why-xolace"
                  error={errors.whyXolace?.message}
                >
                  {(fieldProps) => (
                    <Textarea
                      id="why-xolace"
                      rows={3}
                      placeholder="What draws you to this? No perfect answer needed…"
                      {...fieldProps}
                      {...register("whyXolace")}
                    />
                  )}
                </Field>
                {error ? (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting…" : "Join the Program"}
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  We respect your privacy. No spam, ever.
                </p>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: (fieldProps: {
    "aria-describedby"?: string;
    "aria-invalid": boolean;
  }) => React.ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children({
        "aria-describedby": error ? errorId : undefined,
        "aria-invalid": Boolean(error),
      })}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-xs text-destructive">
      {message}
    </p>
  ) : null;
}
