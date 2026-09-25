import type { Metadata } from "next";

import AmbassadorDashboard from "@/features/(protected)/ambassador/dashboard/pages/ambassador-dashboard";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Dashboard",
  description:
    "Your current mission, recent activity, impact summary and anything waiting on you.",
});

export default function Page() {
  return <AmbassadorDashboard />;
}
