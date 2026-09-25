"use client";

import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import type { PortalRole } from "@/types/portal.type";
import { api } from "../../../convex/_generated/api";

// UX guard only — Convex is the security boundary. `portalRole` comes from a
// static route segment so it cannot be spoofed, but `uuid` can, so it is
// checked against the session.
export function ProtectedRouteGuard({
  portalRole,
  children,
}: {
  portalRole: PortalRole;
  children: ReactNode;
}) {
  const router = useRouter();
  const { uuid } = useParams<{ uuid: string }>();

  // `undefined` means loading, `null` means signed out.
  const user = useQuery(api.users.current);
  const ensureProfile = useMutation(api.users.ensureProfile);

  const isLoading = user === undefined;
  const isSignedIn = user !== null;
  const accountRole = user?.role ?? null;
  const isOwnDashboard = portalRole === accountRole && uuid === user?._id;

  useEffect(() => {
    // Without this, a refresh reads as signed out while the token is still
    // validating and bounces the user to /login.
    if (isLoading) {
      return;
    }

    if (!isSignedIn) {
      router.replace("/login");
      return;
    }

    if (!accountRole) {
      router.replace("/login?error=not-provisioned");
      return;
    }

    if (portalRole !== accountRole || uuid !== user?._id) {
      router.replace(`/${accountRole}/${user?._id}/dashboard`);
    }
  }, [isLoading, isSignedIn, accountRole, portalRole, uuid, user?._id, router]);

  useEffect(() => {
    if (isSignedIn && user?.uuid === null) {
      ensureProfile().catch((err) => {
        console.error("Failed to provision portal uuid:", err);
      });
    }
  }, [isSignedIn, user?.uuid, ensureProfile]);

  if (isLoading || !isSignedIn || !accountRole || !isOwnDashboard) {
    return <GuardLoading />;
  }

  return <>{children}</>;
}

function GuardLoading() {
  return (
    <output className="flex h-[60vh] w-full items-center justify-center">
      <span className="text-sm text-muted-foreground">
        Checking your access…
      </span>
    </output>
  );
}
