import type { Metadata } from "next";

import AdminReports from "@/features/(protected)/admin/reports/pages/admin-reports";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Reports",
  description:
    "Program health, ambassador performance, mission outcomes, and exportable data.",
});

export default function Page() {
  return <AdminReports />;
}
