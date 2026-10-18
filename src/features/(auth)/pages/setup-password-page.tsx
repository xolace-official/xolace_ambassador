"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "../../../../convex/_generated/api";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Choose a password with at least 8 characters."),
    confirmation: z.string(),
  })
  .refine((values) => values.password === values.confirmation, {
    path: ["confirmation"],
    message: "Passwords do not match.",
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export function SetupPasswordPage() {
  const user = useQuery(api.users.current);
  const setPassword = useAction(api.users.setPassword);
  const { signOut } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user === null) window.location.replace("/login");
    if (user && !user.passwordSetupRequired) {
      window.location.replace(`/${user.role}/${user._id}/dashboard`);
    }
  }, [user]);

  async function onSubmit(values: PasswordValues) {
    setSubmitting(true);
    try {
      await setPassword({ newPassword: values.password });
      // The action invalidates existing sessions, so this sign-out is what stops
      // the stale token from bouncing the new password straight back here.
      await signOut();
      toast.success("Password saved", {
        description: "Sign in with your new password to reach your dashboard.",
      });
      window.location.href = "/login?passwordSet=1";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not set your password.",
      );
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <form
        className="flex w-full max-w-md flex-col gap-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            Set your password
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Your temporary password worked. Choose a private password before
            entering the ambassador portal.
          </p>
        </div>
        <p className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
          Once you save, your temporary password stops working. Sign in with the
          password you just chose and you will go straight to your dashboard.
        </p>
        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm font-medium">
            New password
          </label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            placeholder="Choose a new password…"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password-confirmation"
            className="text-sm font-medium"
          >
            Confirm new password
          </label>
          <Input
            id="password-confirmation"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your new password…"
            aria-invalid={Boolean(errors.confirmation)}
            {...register("confirmation")}
          />
          {errors.confirmation ? (
            <p className="text-sm text-destructive">
              {errors.confirmation.message}
            </p>
          ) : null}
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
