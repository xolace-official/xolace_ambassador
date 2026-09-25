import type { Metadata } from "next";

import AdminReports from "@/features/(protected)/admin/reports/pages/admin-reports";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Reports",
  description:
    "Structured program, ambassador, mission and impact reports, with exports.",
});

export default function Page() {
  return <AdminReports />;
}
