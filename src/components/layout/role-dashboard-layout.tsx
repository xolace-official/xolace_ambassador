"use client";

import type { ReactNode } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { ProtectedRouteGuard } from "@/components/layout/protected-route-guard";
import type { PortalRole } from "@/types/portal.type";

export function RoleDashboardLayout({
  portalRole,
  children,
}: {
  portalRole: PortalRole;
  children: ReactNode;
}) {
  return (
    <ProtectedRouteGuard portalRole={portalRole}>
      <DashboardShell portalRole={portalRole}>{children}</DashboardShell>
    </ProtectedRouteGuard>
  );
}
