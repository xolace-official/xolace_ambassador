"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  MISSION_CATEGORIES,
  MISSION_CATEGORY_LABELS,
  MISSION_DIFFICULTIES,
  MISSION_SUBMISSION_FIELD_TYPES,
} from "@/types/missions.type";
import { api } from "../../../../../../convex/_generated/api";

const missionSchema = z.object({
  title: z.string().trim().min(3, "Enter a title with at least 3 characters."),
  summary: z
    .string()
    .trim()
    .min(20, "Add a summary with at least 20 characters.")
    .max(240, "Keep the summary under 240 characters."),
  description: z
    .string()
    .trim()
    .min(30, "Add a brief with at least 30 characters."),
  track: z.enum(MISSION_CATEGORIES),
  points: z
    .number({ error: "Enter a whole number of points." })
    .int("Enter a whole number of points.")
    .min(1, "Award at least 1 point."),
  difficulty: z.enum(MISSION_DIFFICULTIES),
  status: z.enum(["draft", "published"]),
  submissionFields: z
    .array(
      z.object({
        label: z
          .string()
          .trim()
          .min(2, "Use at least 2 characters.")
          .max(80, "Keep the label under 80 characters."),
        type: z.enum(MISSION_SUBMISSION_FIELD_TYPES),
        required: z.boolean(),
      }),
    )
    .max(6, "Add no more than 6 fields.")
    .superRefine((fields, context) => {
      const labels = fields.map((field) => field.label.toLowerCase());
      if (new Set(labels).size !== labels.length) {
        context.addIssue({
          code: "custom",
          message: "Use a different label for each field.",
        });
      }
    }),
  endsAt: z
    .string()
    .min(1, "Choose a deadline.")
    .refine((value) => Number.isFinite(Date.parse(value)), {
      message: "Enter a valid deadline.",
    })
    .refine((value) => Date.parse(value) > Date.now(), {
      message: "Choose a deadline in the future.",
    }),
});

type MissionFormValues = z.infer<typeof missionSchema>;

export function AdminMissionForm({ uuid }: { uuid: string }) {
  const router = useRouter();
  const createMission = useMutation(api.missions.adminCreate);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MissionFormValues>({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      title: "",
      summary: "",
      description: "",
      submissionFields: [],
      status: "draft",
      endsAt: "",
    },
  });
  const {
    fields: responseFields,
    append: appendResponseField,
    remove: removeResponseField,
  } = useFieldArray({ control, name: "submissionFields" });

  async function onSubmit(values: MissionFormValues) {
    try {
      await createMission({
        ...values,
        endsAt: new Date(values.endsAt).getTime(),
        submissionFields: values.submissionFields,
      });
      toast.success(
        values.status === "published"
          ? "Mission published."
          : "Mission saved as a draft.",
      );
      router.replace(`/admin/${uuid}/missions`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not create this mission. Try again.",
      );
    }
  }

  return (
    <Card className="rounded-none border-0 bg-transparent p-0 shadow-none sm:rounded-xl sm:border-border sm:bg-card sm:p-8 sm:shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="order-2 space-y-8 lg:order-1">
            <section
              aria-labelledby="mission-content-heading"
              className="border-b border-border pb-6 last:border-0 last:pb-0 lg:border-0 lg:pb-0"
            >
              <div className="mb-5">
                <h2
                  id="mission-content-heading"
                  className="text-lg font-semibold text-foreground"
                >
                  Mission content
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Make the task clear, useful, and safe to complete.
                </p>
              </div>
              <FieldGroup>
                <Field data-invalid={!!errors.title}>
                  <FieldLabel htmlFor="title">Mission title</FieldLabel>
                  <Input
                    id="title"
                    autoComplete="off"
                    placeholder="Start a conversation about emotional wellbeing…"
                    aria-invalid={!!errors.title}
                    {...register("title")}
                  />
                  <FieldError errors={[errors.title]} />
                </Field>

                <Field data-invalid={!!errors.summary}>
                  <FieldLabel htmlFor="summary">Card summary</FieldLabel>
                  <Textarea
                    id="summary"
                    rows={2}
                    placeholder="One clear sentence that explains the task…"
                    aria-invalid={!!errors.summary}
                    {...register("summary")}
                  />
                  <FieldDescription>
                    This short description appears in the ambassador mission
                    listing.
                  </FieldDescription>
                  <FieldError errors={[errors.summary]} />
                </Field>

                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor="description">Mission brief</FieldLabel>
                  <Textarea
                    id="description"
                    rows={8}
                    placeholder={
                      "Explain what to do, how to do it, and what to submit…"
                    }
                    aria-invalid={!!errors.description}
                    {...register("description")}
                  />
                  <FieldDescription>
                    Include the goal, steps, expected contribution, and any
                    safety guidance. Separate paragraphs with a blank line.
                  </FieldDescription>
                  <FieldError errors={[errors.description]} />
                </Field>
              </FieldGroup>
            </section>

            <section
              aria-labelledby="mission-response-heading"
              className="border-b border-border pb-6 last:border-0 last:pb-0 lg:border-0 lg:pb-0"
            >
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2
                    id="mission-response-heading"
                    className="text-lg font-semibold text-foreground"
                  >
                    Submission fields
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add up to 6 fields ambassadors can use to share their work.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 w-full sm:w-auto"
                  disabled={responseFields.length >= 6}
                  onClick={() =>
                    appendResponseField({
                      label: "",
                      type: "short_text",
                      required: true,
                    })
                  }
                >
                  <Plus aria-hidden="true" />
                  Add field
                </Button>
              </div>

              {responseFields.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                  Without custom fields, ambassadors get the standard response
                  form.
                </p>
              ) : (
                <div className="space-y-3">
                  {responseFields.map((responseField, index) => (
                    <div
                      key={responseField.id}
                      className="grid gap-3 border-t border-border py-4 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end sm:rounded-lg sm:border sm:p-4 sm:first:border-t sm:first:pt-4"
                    >
                      <Field
                        data-invalid={!!errors.submissionFields?.[index]?.label}
                      >
                        <FieldLabel htmlFor={`submission-label-${index}`}>
                          Field label
                        </FieldLabel>
                        <Input
                          id={`submission-label-${index}`}
                          autoComplete="off"
                          placeholder="What did you learn?…"
                          aria-invalid={
                            !!errors.submissionFields?.[index]?.label
                          }
                          {...register(`submissionFields.${index}.label`)}
                        />
                        <FieldError
                          errors={[errors.submissionFields?.[index]?.label]}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor={`submission-type-${index}`}>
                          Answer type
                        </FieldLabel>
                        <Controller
                          control={control}
                          name={`submissionFields.${index}.type`}
                          render={({ field: input }) => (
                            <Select
                              value={input.value}
                              onValueChange={input.onChange}
                            >
                              <SelectTrigger
                                id={`submission-type-${index}`}
                                className="w-full"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="short_text">
                                  Short answer
                                </SelectItem>
                                <SelectItem value="long_text">
                                  Long answer
                                </SelectItem>
                                <SelectItem value="url">Link</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </Field>

                      <div className="flex min-h-11 items-center justify-between gap-3 sm:justify-start">
                        <label
                          htmlFor={`submission-required-${index}`}
                          className="inline-flex items-center gap-2 text-sm text-foreground"
                        >
                          <input
                            id={`submission-required-${index}`}
                            type="checkbox"
                            className="size-4 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            {...register(`submissionFields.${index}.required`)}
                          />
                          Required
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${responseField.label || "submission"} field`}
                          onClick={() => removeResponseField(index)}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <FieldError errors={[errors.submissionFields?.root]} />
                </div>
              )}
            </section>

            <section
              aria-labelledby="mission-schedule-heading"
              className="border-b border-border pb-6 last:border-0 last:pb-0 lg:border-0 lg:pb-0"
            >
              <div className="mb-5">
                <h2
                  id="mission-schedule-heading"
                  className="text-lg font-semibold text-foreground"
                >
                  Schedule
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Set the last date ambassadors can submit their work.
                </p>
              </div>
              <Field data-invalid={!!errors.endsAt}>
                <FieldLabel htmlFor="endsAt">Submission deadline</FieldLabel>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  autoComplete="off"
                  aria-invalid={!!errors.endsAt}
                  {...register("endsAt")}
                />
                <FieldDescription>
                  The mission becomes unavailable after this local date and
                  time.
                </FieldDescription>
                <FieldError errors={[errors.endsAt]} />
              </Field>
            </section>
          </div>

          <aside className="order-1 space-y-6 lg:order-2">
            <section
              className="border-b border-border pb-6 lg:border-0 lg:pb-0"
              aria-labelledby="mission-setup-heading"
            >
              <div className="mb-5">
                <h2
                  id="mission-setup-heading"
                  className="text-lg font-semibold text-foreground"
                >
                  Setup
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose the track and effort level.
                </p>
              </div>
              <FieldGroup>
                <Field data-invalid={!!errors.track}>
                  <FieldLabel htmlFor="track">Mission track</FieldLabel>
                  <Controller
                    control={control}
                    name="track"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="track"
                          aria-invalid={!!errors.track}
                          className="w-full"
                        >
                          <SelectValue placeholder="Choose a track" />
                        </SelectTrigger>
                        <SelectContent>
                          {MISSION_CATEGORIES.map((track) => (
                            <SelectItem key={track} value={track}>
                              {MISSION_CATEGORY_LABELS[track]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.track]} />
                </Field>

                <Field data-invalid={!!errors.difficulty}>
                  <FieldLabel htmlFor="difficulty">Difficulty</FieldLabel>
                  <Controller
                    control={control}
                    name="difficulty"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="difficulty"
                          aria-invalid={!!errors.difficulty}
                          className="w-full capitalize"
                        >
                          <SelectValue placeholder="Choose difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {MISSION_DIFFICULTIES.map((difficulty) => (
                            <SelectItem
                              key={difficulty}
                              value={difficulty}
                              className="capitalize"
                            >
                              {difficulty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.difficulty]} />
                </Field>

                <Field data-invalid={!!errors.points}>
                  <FieldLabel htmlFor="points">Impact points</FieldLabel>
                  <Input
                    id="points"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    placeholder="e.g. 20…"
                    aria-invalid={!!errors.points}
                    {...register("points", { valueAsNumber: true })}
                  />
                  <FieldDescription>
                    Reward the quality and effort of the contribution, not raw
                    reach alone.
                  </FieldDescription>
                  <FieldError errors={[errors.points]} />
                </Field>

                <Field data-invalid={!!errors.status}>
                  <FieldLabel htmlFor="status">Initial status</FieldLabel>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="status"
                          aria-invalid={!!errors.status}
                          className="w-full"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Save as draft</SelectItem>
                          <SelectItem value="published">Publish now</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.status]} />
                </Field>
              </FieldGroup>
            </section>
          </aside>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating mission…" : "Create mission"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
