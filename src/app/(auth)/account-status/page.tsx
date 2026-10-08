import type { Metadata } from "next";
import { AccountStatusPage } from "@/features/(auth)/pages/account-status-page";

export const metadata: Metadata = {
  title: "Account status",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AccountStatusPage />;
}
