"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  /**
   * Once signIn() succeeds, Convex updates `user`.
   * When the user is available, redirect to:
   *
   * /{role}/{user._id}/dashboard
   *
   * Example:
   * /admin/j57abc123/dashboard
   */
  useEffect(() => {
    if (!user || !user.role || !user._id) {
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
        "Sign in failed. Check your email and password and try again."
      );

      setIsSubmitting(false);
    }
  }

  // Once authenticated, we're waiting for the user query
  // to give us the role and ID before navigating.
  if (user?.role && user?._id) {
    return null;
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
