import { AuthLayout } from "@/components/layout/auth-layout";
import { LoginForm } from "@/features/(auth)/components/login-form";

export function LoginPage() {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    )
}
