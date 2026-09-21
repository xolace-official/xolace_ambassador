import { useAuth } from "@convex-dev/auth/react";

/**
 * Returns true if the currently authenticated user is allowed to access the
 * feature identified by `featureKey`.
 *
 * Permissions are defined per role. Admins have full access; ambassadors have a
 * curated subset. Extend the `permissions` map when new features are added.
 */
export function useCanDo(featureKey: string): boolean {
  const { user } = useAuth();
  const role = user?.customData?.role as "admin" | "ambassador" | undefined;

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
