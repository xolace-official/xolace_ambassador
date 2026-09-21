import { useEffect } from "react";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

/**
 * Hook that redirects an authenticated user to their role/uuid dashboard.
 * It is used inside the LoginUI component after a successful sign‑in.
 */
export function useAuthRedirect() {
  const { user, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const role = user.customData?.role as "admin" | "ambassador";
      const uuid = user.customData?.uuid as string;
      if (role && uuid) {
        router.push(`/${role}/${uuid}/dashboard`);
      }
    }
  }, [isLoading, user, router]);
}
