"use client";

import { useQuery } from "convex/react";
import type { PortalRole } from "@/types/portal.type";
import { api } from "../../convex/_generated/api";

// Nav visibility only. Enforcement is in the Convex functions, not here.
export const ROLE_PERMISSIONS: Record<PortalRole, readonly string[]> = {
  admin: [
    "overview",
    "manageAmbassadors",
    "missions",
    "analytics",
    "resources",
    "communities",
    "reports",
  ],
  ambassador: [
    "dashboard",
    "missions",
    "impact",
    "resources",
    "community",
    "rewards",
  ],
};

export function useCanDo(featureKey: string): boolean {
  const user = useQuery(api.users.current);

  const role = user?.role;

  if (!role) return false;

  return ROLE_PERMISSIONS[role]?.includes(featureKey) ?? false;
}
