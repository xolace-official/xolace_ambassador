import type { Metadata } from "next";
import type { ReactNode } from "react";

import { RoleDashboardLayout } from "@/components/layout/role-dashboard-layout";

export const metadata: Metadata = {
  title: {
    default: "Admin Portal",
    template: "%s · Xolace Ambassadors",
  },
  description:
    "Manage Xolace ambassadors, missions, communities and program impact.",
  // Private, per-user surface — never index it.
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleDashboardLayout portalRole="admin">{children}</RoleDashboardLayout>
  );
}
