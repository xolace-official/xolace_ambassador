import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";


export function useCanDo(featureKey: string): boolean {
  const user = useQuery(api.users.current);

  const role = user?.role as "admin" | "ambassador" | undefined;

  const permissions: Record<string, string[]> = {
    admin: [
      "overview",
      "manageAmbassadors",
      "missions",
      "analytics",
      "dashboard",
      "resources",
      "community",
      "rewards",
    ],
    ambassador: ["dashboard", "missions", "resources", "community", "rewards"],
  };

  if (!role) return false;
  return permissions[role]?.includes(featureKey) ?? false;
}
