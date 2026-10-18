"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex/react";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "../../../../convex/_generated/api";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const searchParams = useSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awaitingAccess, setAwaitingAccess] = useState(false);

  // Set by the setup-password page after a successful change. The token is gone
  // by then, so this is the only signal the user has that the save worked.
  const justSetPassword = searchParams.get("passwordSet") === "1";

  // Gets the currently authenticated user from Convex.
  const user = useQuery(api.users.current);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!user || !user._id) {
      return;
    }

    // Authenticated but not yet granted a portal role. There is no dashboard to
    // send them to, so say so instead of leaving them on a form that will never
    // submit again.
    if (!user.role) {
      setAwaitingAccess(true);
      return;
    }

    if (user.passwordSetupRequired) {
      router.replace("/setup-password");
      return;
    }

    router.replace(`/${user.role}/${user._id}/dashboard`);
  }, [user, router]);

  async function onSubmit(values: LoginValues) {
    setIsSubmitting(true);

    try {
      await signIn("password", {
        ...values,
        flow: "signIn",
      });
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        "Sign in failed. Check your email and password and try again.",
      );

      setIsSubmitting(false);
    }
  }

  // Once authenticated, we're waiting for the user query
  // to give us the role and ID before navigating.
  if (user?.role && user?._id) {
    return null;
  }

  if (awaitingAccess) {
    return (
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border/60 p-6 text-center">
        <h2 className="font-medium text-2xl tracking-wide text-foreground">
          You&apos;re signed in
        </h2>
        <p className="text-sm text-muted-foreground">
          Your account isn&apos;t linked to an ambassador role yet. Ask a
          program admin to grant you access, then sign in again.
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-4 md:gap-8"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="flex flex-col">
        <h2 className="font-meduim text-4xl tracking-wide text-foreground capitalize">
          Sign In
        </h2>

        {/* <p className="text-sm text-muted-foreground">
          Enter your credentials to manage the account.
        </p> */}
      </div>

      {justSetPassword ? (
        <div
          aria-live="polite"
          className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm leading-6 text-muted-foreground"
        >
          <span className="font-medium text-foreground">
            Your password is set.
          </span>{" "}
          Sign in with the password you just chose and you will go straight to
          your dashboard.
        </div>
      ) : null}

      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          {/* <FieldLabel htmlFor="email" className="text-sm hidden md:block">
            Email
          </FieldLabel> */}

          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Email or Username"
            aria-invalid={!!errors.email}
            className="h-12 border-2 border-foreground/30 bg-muted/30 px-4 text-base focus-visible:border-primary rounded-full"
            {...register("email")}
          />

          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.password}>
          {/* <FieldLabel htmlFor="password" className="text-sm hidden md:block">
            Password
          </FieldLabel> */}

          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            aria-invalid={!!errors.password}
            className="h-12 border-2 border-foreground/30 bg-muted/30 px-4 text-base focus-visible:border-primary rounded-full"
            {...register("password")}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-muted-foreground/70 transition-colors hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>
          <FieldError errors={[errors.password]} />
        </Field>

        <Button
          type="submit"
          disabled={isSubmitting || !!user?.role}
          className="h-13 w-full text-lg font-semibold rounded-full"
        >
          {isSubmitting || !!user?.role ? (
            "Signing in…"
          ) : (
            <>
              <LogIn className="h-4 w-4 stroke-[1.8]" />
              <span>Sign In</span>
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
