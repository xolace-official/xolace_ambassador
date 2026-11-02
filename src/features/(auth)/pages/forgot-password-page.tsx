"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConvexError } from "convex/values";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RESET_RATE_LIMITED } from "../../../../convex/model/emailAddress";

// Unknown emails are throttled too, so this message is safe to show: it says
// nothing about whether the account exists.
function rateLimitMessage(error: unknown): string | null {
  if (!(error instanceof ConvexError)) return null;
  const data = error.data as { code?: unknown; retryAfterMs?: unknown };
  if (data?.code !== RESET_RATE_LIMITED) return null;
  const ms = typeof data.retryAfterMs === "number" ? data.retryAfterMs : 0;
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  return `Too many requests. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

const requestSchema = z.object({
  email: z.email("Enter a valid email address."),
});

const resetSchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^\d{8}$/, "Enter the 8-digit code from the email."),
    password: z
      .string()
      .min(8, "Choose a password with at least 8 characters."),
    confirmation: z.string(),
  })
  .refine((values) => values.password === values.confirmation, {
    path: ["confirmation"],
    message: "Passwords do not match.",
  });

type RequestValues = z.infer<typeof requestSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export function ForgotPasswordPage() {
  // Held in memory only: the email never goes in the URL.
  const [email, setEmail] = useState<string | null>(null);

  return (
    <AuthLayout>
      {email === null ? (
        <RequestCodeForm onSent={setEmail} />
      ) : (
        <ResetPasswordForm email={email} onChangeEmail={() => setEmail(null)} />
      )}
    </AuthLayout>
  );
}

function RequestCodeForm({ onSent }: { onSent: (email: string) => void }) {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestValues>({ resolver: zodResolver(requestSchema) });

  async function onSubmit(values: RequestValues) {
    setSubmitting(true);
    try {
      await signIn("password", { email: values.email, flow: "reset" });
      onSent(values.email);
    } catch (error) {
      toast.error(
        rateLimitMessage(error) ??
          "Could not send a reset code. Try again in a moment.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">
          Forgot your password?
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Enter the email you sign in with and we&apos;ll send you a code to
          choose a new password.
        </p>
      </div>
      <div className="space-y-2">
        <label htmlFor="reset-email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="reset-email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending code…" : "Send reset code"}
      </Button>
      <Link
        href="/login"
        className="text-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Back to sign in
      </Link>
    </form>
  );
}

function ResetPasswordForm({
  email,
  onChangeEmail,
}: {
  email: string;
  onChangeEmail: () => void;
}) {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  async function onSubmit(values: ResetValues) {
    setSubmitting(true);
    try {
      await signIn("password", {
        email,
        code: values.code,
        newPassword: values.password,
        flow: "reset-verification",
      });
      toast.success("Password updated", {
        description: "You're signed in with your new password.",
      });
      // The login page already knows where a signed-in user belongs.
      router.replace("/login");
    } catch {
      toast.error("That code is wrong or has expired.", {
        description: "Check the latest email, or send a new code.",
      });
      setSubmitting(false);
    }
  }

  async function resendCode() {
    setResending(true);
    try {
      await signIn("password", { email, flow: "reset" });
      toast.success("If that account exists, a new code is on its way.");
    } catch (error) {
      toast.error(
        rateLimitMessage(error) ??
          "Could not send a new code. Try again in a moment.",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">
          Check your email
        </h1>
        <p
          aria-live="polite"
          className="text-sm leading-6 text-muted-foreground"
        >
          If an account exists for{" "}
          <span className="break-all font-medium text-foreground">{email}</span>
          , we&apos;ve sent it an 8-digit code. It expires in 15 minutes.
        </p>
      </div>
      <div className="space-y-2">
        <label htmlFor="reset-code" className="text-sm font-medium">
          Reset code
        </label>
        <Input
          id="reset-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          spellCheck={false}
          placeholder="12345678"
          aria-invalid={Boolean(errors.code)}
          {...register("code")}
        />
        {errors.code ? (
          <p className="text-sm text-destructive">{errors.code.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="reset-password" className="text-sm font-medium">
          New password
        </label>
        <Input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          placeholder="Choose a new password…"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="reset-confirmation" className="text-sm font-medium">
          Confirm new password
        </label>
        <Input
          id="reset-confirmation"
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
        {submitting ? "Saving…" : "Save new password"}
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={resending}
          onClick={() => void resendCode()}
        >
          {resending ? "Sending…" : "Send a new code"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onChangeEmail}>
          Use a different email
        </Button>
      </div>
    </form>
  );
}
