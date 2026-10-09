"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Info,
  Plus,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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

const SOCIAL_PLATFORMS = [
  { key: "x", label: "X", placeholder: "Your X handle or link…" },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "Your LinkedIn profile link…",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "Your Instagram handle…",
  },
  { key: "tiktok", label: "TikTok", placeholder: "Your TikTok handle…" },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "Your YouTube channel link…",
  },
  { key: "github", label: "GitHub", placeholder: "Your GitHub profile link…" },
  {
    key: "snapchat",
    label: "Snapchat",
    placeholder: "Your Snapchat username…",
  },
  { key: "reddit", label: "Reddit", placeholder: "Your Reddit username…" },
] as const;

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters.").max(120),
  email: z.email({ error: "Enter a valid email address." }),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose your date of birth.")
    .refine((value) => new Date(`${value}T00:00:00Z`) <= new Date(), {
      error: "Date of birth cannot be in the future.",
    }),
  location: z.string().trim().min(2, "Enter your city and country.").max(120),
  schoolOrCommunity: z.string().max(160),
  track: z.enum(
    ["creator", "community", "growth", "creative", "production", "advocacy"],
    { error: "Choose a track." },
  ),
  meetingSlotId: z.string(),
  referralCode: z.string().trim().max(20, "Keep the referral code short."),
  whyXolace: z
    .string()
    .trim()
    .min(20, "Write at least 20 characters.")
    .max(4000),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

const initialFormData = {
  name: "",
  email: "",
  dateOfBirth: "",
  location: "",
  schoolOrCommunity: "",
  track: "creator" as const,
  meetingSlotId: "",
  referralCode: "",
  whyXolace: "",
};

const TRACKS = [
  "creator",
  "community",
  "growth",
  "creative",
  "production",
  "advocacy",
] as const;

const TRACK_HINTS: Record<(typeof TRACKS)[number], string> = {
  creator: "Make helpful content that introduces people to Xolace.",
  community: "Build welcoming spaces and connect people around Xolace.",
  growth: "Help more people discover and start using Xolace.",
  creative: "Shape ideas, visuals, and campaigns that tell the Xolace story.",
  production: "Turn plans into reliable events, projects, and experiences.",
  advocacy: "Speak up for emotional wellbeing and reduce mental health stigma.",
};

const steps = ["About You", "Social Profiles", "Your Interest"] as const;

const reassurances = [
  "We read every application — no bots, no filters.",
  "You'll hear back within 24 hours, either way.",
  "Onboarding starts right after — no waiting around.",
];

export default function JoinProgramForm() {
  const submitApplication = useMutation(api.applications.submit);
  const [currentTime] = React.useState(() => Date.now());
  const meetingSlots = useQuery(api.applications.listMeetingSlots, {
    now: currentTime,
  });
  const requestUploadUrl = useAction(api.applications.requestUploadUrl);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const [socials, setSocials] = React.useState<Map<string, string>>(new Map());
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const {
    register,
    control,
    handleSubmit,
    trigger,
    setValue,
    setError: setFieldError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: initialFormData,
  });

  React.useEffect(() => {
    const referralCode = new URLSearchParams(window.location.search)
      .get("ref")
      ?.trim()
      .toUpperCase();
    if (referralCode) setValue("referralCode", referralCode);
  }, [setValue]);

  const email = watch("email");
  const selectedTrack = watch("track");
  const emailExists = useQuery(
    api.applications.checkEmailExists,
    email?.includes("@") ? { email } : "skip",
  );

  function toggleSocial(platform: string) {
    setSocials((prev) => {
      const next = new Map(prev);
      if (next.has(platform)) {
        next.delete(platform);
      } else if (next.size < 6) {
        next.set(platform, "");
      }
      return next;
    });
  }

  function updateSocial(platform: string, value: string) {
    setSocials((prev) => new Map(prev).set(platform, value));
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be under 5 MB.");
      return;
    }
    setImageError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleStepNext() {
    const fieldsToValidate: (keyof ApplicationForm)[][] = [
      ["name", "email", "dateOfBirth", "location"],
      [],
      ["track", "whyXolace"],
    ];
    const fields = fieldsToValidate[currentStep];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    if (currentStep === 0 && !imageFile) {
      setImageError("A profile photo is required.");
      return;
    }
    if (currentStep === 1) {
      const hasSocial = [...socials.values()].some((v) => v.trim().length > 0);
      if (!hasSocial) {
        setError("Add at least one social profile.");
        return;
      }
    }
    if (currentStep === 2 && !validateMeetingSlot()) return;
    setError(null);
    setCurrentStep((s) => Math.min(s + 1, 2));
  }

  // Only required while slots exist; applicants are never blocked when none are
  // available.
  function validateMeetingSlot() {
    if (meetingSlots && meetingSlots.length > 0 && !watch("meetingSlotId")) {
      setFieldError("meetingSlotId", {
        message: "Choose one of the available meeting times.",
      });
      return false;
    }
    clearErrors("meetingSlotId");
    return true;
  }

  function handleStepBack() {
    setError(null);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: ApplicationForm) {
    if (!imageFile) {
      setImageError("A profile photo is required.");
      setCurrentStep(0);
      return;
    }
    const hasSocial = [...socials.values()].some((v) => v.trim().length > 0);
    if (!hasSocial) {
      setError("Add at least one social profile.");
      setCurrentStep(1);
      return;
    }
    if (emailExists) {
      setError("An application with this email is already on file.");
      setCurrentStep(0);
      return;
    }
    if (meetingSlots && meetingSlots.length > 0 && !values.meetingSlotId) {
      setError("Choose one of the available meeting times.");
      setCurrentStep(2);
      return;
    }

    setError(null);
    setUploadingImage(true);

    let imageStorageId: string | undefined;
    try {
      const uploadUrl = await requestUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": imageFile.type },
        body: imageFile,
      });
      if (!response.ok) throw new Error("Upload failed.");
      const { storageId } = (await response.json()) as { storageId: string };
      imageStorageId = storageId;
    } catch {
      setError("Could not upload your photo. Please try again.");
      setUploadingImage(false);
      return;
    }

    try {
      const socialsArray = [...socials.entries()]
        .filter(([, handle]) => handle.trim().length > 0)
        .map(([platform, handle]) => ({ platform, handle: handle.trim() }));

      await submitApplication({
        name: values.name,
        email: values.email,
        dateOfBirth: values.dateOfBirth,
        location: values.location,
        school: values.schoolOrCommunity || undefined,
        socials: socialsArray,
        trackInterest: values.track,
        meetingSlotId: values.meetingSlotId || undefined,
        whyXolace: values.whyXolace,
        referralCode: values.referralCode || undefined,
        image: imageStorageId as never,
      });
      toast.success("Application submitted successfully!");
      setSubmitted(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not submit your application. Please try again.",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  if (submitted) {
    return (
      <section
        id="apply"
        className="relative w-full overflow-hidden bg-background px-4 py-20 scroll-mt-20 sm:px-6 lg:px-8"
      >
        <div className="relative mx-auto max-w-2xl">
          <Card className="rounded-3xl border border-border/40 bg-card p-8 shadow-xl sm:p-12">
            <div aria-live="polite" className="space-y-6 text-center">
              <span className="inline-flex size-16 items-center justify-center rounded-full bg-accent/20">
                <Check aria-hidden="true" className="size-8 text-accent" />
              </span>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold">Application received</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Thank you for applying to the Xolace Ambassadors Program. Our
                  team will review your application and get back to you within
                  24 hours.
                </p>
                <p className="text-sm font-medium text-primary">
                  Please check your email — we&apos;ll reach out soon.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    );
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
          <div className="space-y-2">
            <h2 className="text-2xl font-bold md:text-balance sm:text-3xl">
              Want to join our Ambassador Program?
            </h2>
            <p className="text-base leading-relaxed text-foreground/70">
              Be part of a global movement making mental health support
              accessible to everyone.
            </p>
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
            <nav
              aria-label="Application progress"
              className="mb-6 flex w-full items-center justify-between gap-2"
            >
              {steps.map((label, index) => (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`flex size-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                        index <= currentStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index < currentStep ? (
                        <Check aria-hidden="true" className="size-4" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        index <= currentStep
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {index < steps.length - 1 ? (
                    <div
                      aria-hidden="true"
                      className={`h-px flex-1 ${
                        index < currentStep ? "bg-primary" : "bg-border"
                      }`}
                    />
                  ) : null}
                </React.Fragment>
              ))}
            </nav>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {currentStep === 0 ? (
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Upload profile photo (required)"
                      >
                        {imagePreview ? (
                          <>
                            <img
                              src={imagePreview}
                              alt="Profile preview"
                              className="size-full object-cover"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <Camera
                                aria-hidden="true"
                                className="size-5 text-white"
                              />
                            </span>
                          </>
                        ) : (
                          <Camera
                            aria-hidden="true"
                            className="size-6 text-muted-foreground"
                          />
                        )}
                      </button>
                      {imagePreview ? (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Remove photo"
                        >
                          <X aria-hidden="true" className="size-3" />
                        </button>
                      ) : null}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1 pt-1">
                      <p className="text-sm font-medium">
                        Profile photo{" "}
                        <span aria-hidden="true" className="text-destructive">
                          *
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Required. A clear photo helps us put a face to your
                        application.
                      </p>
                      {imageError ? (
                        <p role="alert" className="text-xs text-destructive">
                          {imageError}
                        </p>
                      ) : null}
                    </div>
                  </div>

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
                        <div className="space-y-1">
                          <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            spellCheck={false}
                            placeholder="you@example.com…"
                            {...fieldProps}
                            {...register("email")}
                          />
                          {emailExists ? (
                            <p className="text-xs text-destructive">
                              An application with this email already exists.
                            </p>
                          ) : null}
                        </div>
                      )}
                    </Field>
                    <Field
                      label="Date of birth"
                      id="date-of-birth"
                      error={errors.dateOfBirth?.message}
                    >
                      {(fieldProps) => (
                        <Input
                          id="date-of-birth"
                          type="date"
                          autoComplete="bday"
                          {...fieldProps}
                          {...register("dateOfBirth")}
                        />
                      )}
                    </Field>
                    <Field
                      label="Referral code (optional)"
                      id="referral-code"
                      error={errors.referralCode?.message}
                    >
                      {(fieldProps) => (
                        <Input
                          id="referral-code"
                          placeholder="AMB-XXXXXXXX…"
                          autoComplete="off"
                          spellCheck={false}
                          {...fieldProps}
                          {...register("referralCode")}
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
                </div>
              ) : null}

              {currentStep === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Social profiles{" "}
                      <span aria-hidden="true" className="text-destructive">
                        *
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Select the platforms you&apos;re active on and add your
                      handle or profile link. At least one is required.
                    </p>
                  </div>
                  <fieldset className="flex flex-wrap gap-2 border-0 p-0 m-0">
                    <legend className="sr-only">Social platforms</legend>
                    {SOCIAL_PLATFORMS.map((platform) => {
                      const isSelected = socials.has(platform.key);
                      return (
                        <button
                          key={platform.key}
                          type="button"
                          onClick={() => toggleSocial(platform.key)}
                          aria-pressed={isSelected}
                          className={`flex min-h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          }`}
                        >
                          {isSelected ? (
                            <Check aria-hidden="true" className="size-3.5" />
                          ) : (
                            <Plus aria-hidden="true" className="size-3.5" />
                          )}
                          {platform.label}
                        </button>
                      );
                    })}
                  </fieldset>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[...socials.entries()]
                      .filter(([key]) =>
                        SOCIAL_PLATFORMS.some((p) => p.key === key),
                      )
                      .map(([key]) => {
                        const platform = SOCIAL_PLATFORMS.find(
                          (p) => p.key === key,
                        );
                        if (!platform) return null;
                        return (
                          <div key={key} className="space-y-2">
                            <label
                              htmlFor={`social-${key}`}
                              className="text-sm font-medium"
                            >
                              {platform.label} handle or link
                            </label>
                            <Input
                              id={`social-${key}`}
                              placeholder={platform.placeholder}
                              value={socials.get(key) ?? ""}
                              onChange={(e) =>
                                updateSocial(key, e.target.value)
                              }
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : null}

              {currentStep === 2 ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="track" className="text-sm font-medium">
                      <span className="inline-flex items-center gap-1">
                        Track
                        <span title="Choose the kind of contribution you want to make.">
                          <Info
                            aria-hidden="true"
                            className="size-3.5 text-muted-foreground"
                          />
                        </span>
                      </span>
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
                                title={TRACK_HINTS[track]}
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
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Info
                        aria-hidden="true"
                        className="mt-0.5 size-3.5 shrink-0"
                      />
                      {TRACK_HINTS[selectedTrack]}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="meeting-slot"
                      className="text-sm font-medium"
                    >
                      Preferred meeting time
                    </label>
                    {meetingSlots && meetingSlots.length === 0 ? (
                      <output className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
                        <Info
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0"
                        />
                        <span>
                          No meeting times are available right now. Please check
                          back later to book a slot.
                        </span>
                      </output>
                    ) : (
                      <>
                        <Controller
                          control={control}
                          name="meetingSlotId"
                          render={({ field }) => (
                            <Select
                              value={field.value || undefined}
                              onValueChange={field.onChange}
                              disabled={!meetingSlots}
                            >
                              <SelectTrigger
                                id="meeting-slot"
                                className="w-full"
                              >
                                <SelectValue placeholder="Choose an available time…" />
                              </SelectTrigger>
                              <SelectContent>
                                {meetingSlots?.map((slot) => (
                                  <SelectItem key={slot.id} value={slot.id}>
                                    {slot.label} UTC
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldError
                          id="meeting-slot-error"
                          message={errors.meetingSlotId?.message}
                        />
                        <p className="text-xs text-muted-foreground">
                          Times are shown in UTC.
                        </p>
                      </>
                    )}
                  </div>
                  <Field
                    label="Why Xolace?"
                    id="why-xolace"
                    error={errors.whyXolace?.message}
                  >
                    {(fieldProps) => (
                      <Textarea
                        id="why-xolace"
                        rows={4}
                        placeholder="What draws you to this? No perfect answer needed…"
                        {...fieldProps}
                        {...register("whyXolace")}
                      />
                    )}
                  </Field>
                </div>
              ) : null}

              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <div className="flex items-center gap-2 pt-2">
                {currentStep > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleStepBack}
                    size="sm"
                    className="h-9 w-24"
                  >
                    <ArrowLeft aria-hidden="true" className="size-3.5" />
                    Back
                  </Button>
                ) : null}
                {currentStep < 2 ? (
                  <Button
                    type="button"
                    onClick={handleStepNext}
                    size="sm"
                    className="h-9 w-24"
                  >
                    Next
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingImage || emailExists}
                    className="h-9 w-full rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploadingImage
                      ? "Uploading…"
                      : isSubmitting
                        ? "Submitting…"
                        : "Join the Program"}
                  </button>
                )}
              </div>
            </form>
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
