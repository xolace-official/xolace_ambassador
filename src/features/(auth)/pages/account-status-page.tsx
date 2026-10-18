"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "../../../../convex/_generated/api";

export function AccountStatusPage() {
  const user = useQuery(api.users.current);
  const { signOut } = useAuthActions();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (user === null) window.location.replace("/login");
    if (user?.programStatus === "active") {
      window.location.replace(`/${user.role}/${user._id}/dashboard`);
    }
  }, [user]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      window.location.href = "/login";
    } catch {
      toast.error("Could not sign out. Please try again.");
      setSigningOut(false);
    }
  }

  const suspended = user?.programStatus === "suspended";

  return (
    <AuthLayout>
      <div
        aria-live="polite"
        className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8"
      >
        <div className="space-y-2">
          <Badge variant={suspended ? "destructive" : "secondary"}>
            {suspended ? "Suspended" : "Paused"}
          </Badge>
          <h1 className="text-3xl font-semibold text-foreground">
            Account {suspended ? "suspended" : "paused"}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Your Xolace Ambassadors portal access is currently{" "}
            {suspended ? "suspended" : "paused"}. Please contact the program
            team for help restoring access.
          </p>
        </div>
        <a
          href="mailto:ambassadors@xolaceinc.com"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Contact support
        </a>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </AuthLayout>
  );
}
