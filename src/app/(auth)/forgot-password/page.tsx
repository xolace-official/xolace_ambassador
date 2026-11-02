import type { Metadata } from "next";
import { ForgotPasswordPage } from "@/features/(auth)/pages/forgot-password-page";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ForgotPasswordPage />;
}
