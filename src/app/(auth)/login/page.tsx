import type { Metadata } from "next"
import { LoginPage } from "@/features/(auth)/pages/login-page";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
}

export default async function Page() {
  return <LoginPage />
}
