import type { Metadata } from "next";

import AdminAnalytics from "@/features/(protected)/admin/analytics/pages/admin-analytics";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Analytics",
  description:
    "Program performance: activity, reach, referrals, content, events and mission outcomes.",
});

export default function Page() {
  return <AdminAnalytics />;
}
