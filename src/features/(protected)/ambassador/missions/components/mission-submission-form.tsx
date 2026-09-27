"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Send } from "lucide-react";
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
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

const submissionSchema = z.object({
  note: z
    .string()
    .min(20, "Describe what you did in at least a couple of sentences."),
  link: z
    .string()
    .refine((value) => value === "" || z.url().safeParse(value).success, {
      message: "Enter a full link starting with https://",
    }),
  quantity: z
    .string()
    .refine((value) => value === "" || /^\d{1,6}$/.test(value), {
      message: "Enter a whole number, or leave this blank.",
    }),
});

type SubmissionValues = z.infer<typeof submissionSchema>;

export function MissionSubmissionForm({
  missionId,
  onSubmitted,
}: {
  missionId: Id<"missions">;
  onSubmitted?: () => void;
}) {
  const submit = useMutation(api.contributions.submit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { note: "", link: "", quantity: "" },
  });

  async function onSubmit(values: SubmissionValues) {
    try {
      await submit({
        missionId,
        note: values.note,
        link: values.link === "" ? undefined : values.link,
        quantity: values.quantity === "" ? undefined : Number(values.quantity),
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
            autoComplete="off"
            spellCheck={false}
            placeholder="https://…"
            aria-invalid={!!errors.link}
            {...register("link")}
          />

          <FieldError errors={[errors.link]} />
        </Field>

        <Field data-invalid={!!errors.quantity}>
          <FieldLabel htmlFor="quantity">How many people took part?</FieldLabel>

          <Input
            id="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="24"
            aria-invalid={!!errors.quantity}
            {...register("quantity")}
          />

          <FieldDescription>
            An estimate is fine. Nobody counts a crowd exactly.
          </FieldDescription>

          <FieldError errors={[errors.quantity]} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-fit">
          <Send aria-hidden="true" />
          {isSubmitting ? "Submitting…" : "Submit for review"}
        </Button>
      </FieldGroup>
    </form>
  );
}
