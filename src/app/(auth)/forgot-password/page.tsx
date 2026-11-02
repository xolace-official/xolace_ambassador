import { ForgotPasswordPage } from "@/features/(auth)/pages/forgot-password-page";
import { portalMetadata } from "@/lib/metadata";

export const metadata = portalMetadata({
  title: "Reset your password",
  description:
    "Get a code by email to choose a new Xolace Ambassadors password.",
});

export default function Page() {
  return <ForgotPasswordPage />;
}
