"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const rewardSchema = z.object({
  name: z.string().trim().min(2, "Enter a reward name."),
  description: z
    .string()
    .trim()
    .min(5, "Describe what the ambassador receives."),
  costPoints: z
    .number()
    .int()
    .positive("Enter a whole-number point cost above zero."),
  stock: z.number().int().nonnegative("Stock cannot be negative.").optional(),
});

type RewardFormValues = z.infer<typeof rewardSchema>;

export function AdminRewardForm({
  onCreate,
}: {
  onCreate: (values: RewardFormValues) => Promise<void>;
}) {
  const form = useForm<RewardFormValues>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      name: "",
      description: "",
      costPoints: 1,
      stock: undefined,
    },
  });

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={form.handleSubmit(async (values) => {
        await onCreate(values);
        form.reset();
      })}
    >
      <div className="grid gap-2">
        <Label htmlFor="reward-name">Reward name</Label>
        <Input
          id="reward-name"
          placeholder="e.g. Xolace notebook…"
          {...form.register("name")}
        />
        <p className="text-xs text-destructive">
          {form.formState.errors.name?.message}
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="reward-cost">Point cost</Label>
        <Input
          id="reward-cost"
          type="number"
          min="1"
          inputMode="numeric"
          {...form.register("costPoints", { valueAsNumber: true })}
        />
        <p className="text-xs text-destructive">
          {form.formState.errors.costPoints?.message}
        </p>
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="reward-description">Description</Label>
        <Textarea
          id="reward-description"
          placeholder="Describe the reward and how it will be fulfilled…"
          {...form.register("description")}
        />
        <p className="text-xs text-destructive">
          {form.formState.errors.description?.message}
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="reward-stock">Stock (optional)</Label>
        <Input
          id="reward-stock"
          type="number"
          min="0"
          inputMode="numeric"
          {...form.register("stock", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
        />
        <p className="text-xs text-destructive">
          {form.formState.errors.stock?.message}
        </p>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating…" : "Create reward"}
        </Button>
      </div>
    </form>
  );
}
