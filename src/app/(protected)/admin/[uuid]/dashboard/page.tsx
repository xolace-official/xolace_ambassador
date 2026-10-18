import type { Metadata } from "next";

import AdminDashboard from "@/features/(protected)/admin/dashboard/pages/admin-dashboard";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Dashboard",
  description:
    "Program-wide overview: active ambassadors, current missions, recent activity and pending actions.",
});

export default function Page() {
  return <AdminDashboard />;
}
