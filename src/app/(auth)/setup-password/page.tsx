import type { Metadata } from "next";
import { SetupPasswordPage } from "@/features/(auth)/pages/setup-password-page";

export const metadata: Metadata = {
  title: "Set your password",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SetupPasswordPage />;
}
