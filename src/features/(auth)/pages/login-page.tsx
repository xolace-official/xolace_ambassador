import { Suspense } from "react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { LoginForm } from "@/features/(auth)/components/login-form";

export function LoginPage() {
  return (
    <AuthLayout>
      {/* LoginForm reads ?passwordSet, which opts out of static prerendering. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
