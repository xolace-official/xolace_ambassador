"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Send } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MissionSubmissionField } from "@/types/missions.type";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

const noSubmissionFields: MissionSubmissionField[] = [];

const baseSchema = z.object({
  note: z.string().max(4000, "Keep your note under 4,000 characters."),
  link: z.string(),
  quantity: z.string(),
  responses: z.record(z.string(), z.string()),
});

type SubmissionValues = z.infer<typeof baseSchema>;

function createSubmissionSchema(fields: MissionSubmissionField[]) {
  return baseSchema.superRefine((values, context) => {
    if (fields.length === 0 && values.note.trim().length < 20) {
      context.addIssue({
        code: "custom",
        path: ["note"],
        message: "Describe what you did in at least a couple of sentences.",
      });
    }

    if (
      fields.length === 0 &&
      values.link !== "" &&
      !z.url().safeParse(values.link).success
    ) {
      context.addIssue({
        code: "custom",
        path: ["link"],
        message: "Enter a full link starting with https://",
      });
    }

    if (
      fields.length === 0 &&
      values.quantity !== "" &&
      !/^\d{1,6}$/.test(values.quantity)
    ) {
      context.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Enter a whole number, or leave this blank.",
      });
    }

    for (const field of fields) {
      const value = values.responses[field.key]?.trim() ?? "";

      if (field.required && value.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["responses", field.key],
          message: `Complete “${field.label}” before submitting.`,
        });
      } else if (
        field.type === "url" &&
        value.length > 0 &&
        !z.url().safeParse(value).success
      ) {
        context.addIssue({
          code: "custom",
          path: ["responses", field.key],
          message: "Enter a full link starting with https://",
        });
      } else if (
        field.type === "number" &&
        value.length > 0 &&
        !/^\d{1,9}$/.test(value)
      ) {
        context.addIssue({
          code: "custom",
          path: ["responses", field.key],
          message: "Enter a whole number.",
        });
      }

      if (value.length > 4000) {
        context.addIssue({
          code: "custom",
          path: ["responses", field.key],
          message: "Keep this answer under 4,000 characters.",
        });
      }
    }
  });
}

export function MissionSubmissionForm({
  missionId,
  submissionFields = noSubmissionFields,
  onSubmitted,
}: {
  missionId: Id<"missions">;
  submissionFields?: MissionSubmissionField[];
  onSubmitted?: () => void;
}) {
  const submit = useMutation(api.contributions.submit);
  const schema = useMemo(
    () => createSubmissionSchema(submissionFields),
    [submissionFields],
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      note: "",
      link: "",
      quantity: "",
      responses: Object.fromEntries(
        submissionFields.map((field) => [field.key, ""]),
      ),
    },
  });

  async function onSubmit(values: SubmissionValues) {
    try {
      const hasCustomFields = submissionFields.length > 0;
      await submit({
        missionId,
        note: values.note.trim() || undefined,
        link: hasCustomFields || values.link === "" ? undefined : values.link,
        quantity:
          hasCustomFields || values.quantity === ""
            ? undefined
            : Number(values.quantity),
        responses: hasCustomFields
          ? submissionFields.map((field) => ({
              fieldKey: field.key,
              label: field.label,
              value: values.responses[field.key]?.trim() ?? "",
            }))
          : undefined,
      });

      reset();
      toast.success("Submitted for review.");
      onSubmitted?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Submission failed. Try again in a moment.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        {submissionFields.length === 0 ? (
          <>
            <Field data-invalid={!!errors.note}>
              <FieldLabel htmlFor="note">What did you do?</FieldLabel>
              <Textarea
                id="note"
                rows={5}
                placeholder="What you ran, who took part, and what came up…"
                aria-invalid={!!errors.note}
                {...register("note")}
              />
              <FieldError errors={[errors.note]} />
            </Field>

            <Field data-invalid={!!errors.link}>
              <FieldLabel htmlFor="link">Link to it (optional)</FieldLabel>
              <Input
                id="link"
                type="url"
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                placeholder="https://…"
                aria-invalid={!!errors.link}
                {...register("link")}
              />
              <FieldError errors={[errors.link]} />
            </Field>

            <Field data-invalid={!!errors.quantity}>
              <FieldLabel htmlFor="quantity">
                How many people took part? (optional)
              </FieldLabel>
              <Input
                id="quantity"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="24…"
                aria-invalid={!!errors.quantity}
                {...register("quantity")}
              />
              <FieldDescription>
                An estimate is fine. Nobody counts a crowd exactly.
              </FieldDescription>
              <FieldError errors={[errors.quantity]} />
            </Field>
          </>
        ) : (
          <>
            {submissionFields.map((field) => (
              <Field
                key={field.key}
                data-invalid={!!errors.responses?.[field.key]}
              >
                <FieldLabel htmlFor={`response-${field.key}`}>
                  {field.label}
                  {field.required ? "" : " (optional)"}
                </FieldLabel>
                {field.type === "long_text" ? (
                  <Textarea
                    id={`response-${field.key}`}
                    rows={4}
                    placeholder="Write your answer…"
                    aria-invalid={!!errors.responses?.[field.key]}
                    {...register(`responses.${field.key}`)}
                  />
                ) : (
                  <Input
                    id={`response-${field.key}`}
                    type={
                      field.type === "url"
                        ? "url"
                        : field.type === "number"
                          ? "number"
                          : "text"
                    }
                    inputMode={
                      field.type === "number"
                        ? "numeric"
                        : field.type === "url"
                          ? "url"
                          : undefined
                    }
                    min={field.type === "number" ? 0 : undefined}
                    autoComplete={field.type === "url" ? "url" : "off"}
                    spellCheck={field.type === "url" ? false : undefined}
                    placeholder={
                      field.type === "url"
                        ? "https://…"
                        : field.type === "number"
                          ? "0…"
                          : "Your answer…"
                    }
                    aria-invalid={!!errors.responses?.[field.key]}
                    {...register(`responses.${field.key}`)}
                  />
                )}
                <FieldError errors={[errors.responses?.[field.key]]} />
              </Field>
            ))}
            <Field data-invalid={!!errors.note}>
              <FieldLabel htmlFor="note">
                Anything else to add? (optional)
              </FieldLabel>
              <Textarea
                id="note"
                rows={3}
                placeholder="Add any useful context…"
                aria-invalid={!!errors.note}
                {...register("note")}
              />
              <FieldError errors={[errors.note]} />
            </Field>
          </>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          <Send aria-hidden="true" />
          {isSubmitting ? "Submitting…" : "Submit for review"}
        </Button>
      </FieldGroup>
    </form>
  );
}
