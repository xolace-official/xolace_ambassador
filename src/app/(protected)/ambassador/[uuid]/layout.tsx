import type { Metadata } from "next";
import type { ReactNode } from "react";

import { RoleDashboardLayout } from "@/components/layout/role-dashboard-layout";

export const metadata: Metadata = {
  title: {
    default: "Ambassador Portal",
    template: "%s · Xolace Ambassadors",
  },
  description:
    "Your Xolace missions, impact, community and rewards as a program ambassador.",
  // Private, per-user surface — never index it.
  robots: { index: false, follow: false },
};

export default function AmbassadorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleDashboardLayout portalRole="ambassador">
      {children}
    </RoleDashboardLayout>
  );
}
