"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

const missionSetSchema = z
  .object({
    name: z.string().trim().min(3, "Enter a name with at least 3 characters."),
    description: z
      .string()
      .trim()
      .max(1000, "Keep the description under 1,000 characters."),
    status: z.enum(["draft", "published", "published_next", "closed"]),
    startsAt: z.string().min(1, "Choose when the set should start."),
    endsAt: z.string().min(1, "Choose when the set should end."),
  })
  .superRefine((values, context) => {
    const startsAt = Date.parse(values.startsAt);
    const endsAt = Date.parse(values.endsAt);

    if (!Number.isFinite(startsAt)) {
      context.addIssue({
        code: "custom",
        path: ["startsAt"],
        message: "Enter a valid start time.",
      });
    }
    if (!Number.isFinite(endsAt)) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Enter a valid end time.",
      });
    }
    if (
      Number.isFinite(startsAt) &&
      Number.isFinite(endsAt) &&
      endsAt <= startsAt
    ) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Choose an end time after the start time.",
      });
    }
  });

type MissionSetFormValues = z.infer<typeof missionSetSchema>;

export type MissionSetInitialValues = {
  _id: Id<"missionSets">;
  name: string;
  description: string | null;
  status: "draft" | "published" | "published_next" | "closed";
  startsAt: number;
  endsAt: number;
};

export function MissionSetForm({
  uuid,
  initial,
  onSaved,
}: {
  uuid: string;
  initial?: MissionSetInitialValues;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const createMissionSet = useMutation(api.missionSets.adminCreate);
  const updateMissionSet = useMutation(api.missionSets.adminUpdate);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MissionSetFormValues>({
    resolver: zodResolver(missionSetSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          description: initial.description ?? "",
          status: initial.status,
          startsAt: toDateTimeLocal(initial.startsAt),
          endsAt: toDateTimeLocal(initial.endsAt),
        }
      : {
          name: "",
          description: "",
          status: "draft",
          startsAt: "",
          endsAt: "",
        },
  });

  async function onSubmit(values: MissionSetFormValues) {
    try {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        status: values.status,
        startsAt: new Date(values.startsAt).getTime(),
        endsAt: new Date(values.endsAt).getTime(),
      };
      if (initial) {
        await updateMissionSet({ ...payload, missionSetId: initial._id });
      } else {
        await createMissionSet(payload);
      }
      toast.success(
        values.status === "published"
          ? initial
            ? "Mission set updated."
            : "Mission set published."
          : initial
            ? "Mission set updated."
            : "Mission set saved as a draft.",
      );
      if (onSaved) {
        onSaved();
      } else {
        router.replace(`/admin/${uuid}/missions`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(
        message.includes("Only one mission set can be active")
          ? "Another mission set is active. Choose ‘Publish as next set’ instead."
          : message || "Could not save this mission set.",
      );
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Set name</FieldLabel>
              <Input
                id="name"
                placeholder="October emotional wellbeing campaign…"
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor="status">Initial status</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" aria-invalid={!!errors.status}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Save as draft</SelectItem>
                      <SelectItem value="published">Publish set</SelectItem>
                      <SelectItem value="published_next">
                        Publish as next set
                      </SelectItem>
                      <SelectItem value="closed">Close set</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.status]} />
            </Field>
          </div>
          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              placeholder="Describe what this group of missions is about…"
              {...register("description")}
            />
            <FieldDescription>
              This helps admins understand the purpose of the set.
            </FieldDescription>
            <FieldError errors={[errors.description]} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={!!errors.startsAt}>
              <FieldLabel htmlFor="startsAt">Display starts</FieldLabel>
              <Input
                id="startsAt"
                type="datetime-local"
                {...register("startsAt")}
              />
              <FieldError errors={[errors.startsAt]} />
            </Field>
            <Field data-invalid={!!errors.endsAt}>
              <FieldLabel htmlFor="endsAt">Display ends</FieldLabel>
              <Input
                id="endsAt"
                type="datetime-local"
                {...register("endsAt")}
              />
              <FieldError errors={[errors.endsAt]} />
            </Field>
          </div>
        </FieldGroup>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : initial
              ? "Save changes"
              : "Save mission set"}
        </Button>
      </form>
    </div>
  );
}

function toDateTimeLocal(timestamp: number): string {
  const date = new Date(timestamp);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(timestamp - offset).toISOString().slice(0, 16);
}
