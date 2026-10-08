"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { LifeBuoy, LogOut, PauseCircle, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PortalAccessOverlay({
  status,
  reason,
  children,
}: {
  status: "paused" | "suspended";
  reason: string | null;
  children: ReactNode;
}) {
  const suspended = status === "suspended";
  const { signOut } = useAuthActions();
  const [signingOut, setSigningOut] = useState(false);
  const StatusIcon = suspended ? ShieldAlert : PauseCircle;

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

  return (
    <div className="relative min-h-screen">
      <div inert aria-hidden="true" className="pointer-events-none select-none">
        {children}
      </div>

      <div className="fixed inset-0 z-modal flex items-end justify-center overscroll-contain bg-surface-inverse/70 p-4 backdrop-blur-md sm:items-center">
        <section
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="portal-access-title"
          className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        >
          <div className="flex flex-col items-center gap-3 px-6 pt-8 text-center sm:px-8">
            <span
              className={`flex size-14 items-center justify-center rounded-2xl ${
                suspended
                  ? "bg-destructive/10 text-destructive"
                  : "bg-warning/15 text-warning"
              }`}
            >
              <StatusIcon aria-hidden="true" className="size-7" />
            </span>
            <Badge variant={suspended ? "destructive" : "secondary"}>
              {suspended ? "Suspended" : "Paused"}
            </Badge>
            <h1
              id="portal-access-title"
              className="text-2xl font-semibold tracking-tight text-foreground"
            >
              Your access is {suspended ? "suspended" : "paused"}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              You can still see the portal, but your ambassador tools are locked
              until the program team restores your access.
            </p>
          </div>

          <div className="mx-6 mt-5 rounded-2xl border border-border bg-muted/40 p-4 text-left sm:mx-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Reason
            </p>
            <p className="mt-1 text-sm leading-6 text-foreground">
              {reason ||
                `Your account is currently ${suspended ? "suspended" : "paused"} by the Xolace program team.`}
            </p>
          </div>

          <div className="flex flex-col gap-2 p-6 sm:flex-row sm:justify-center sm:px-8">
            <Button asChild className="sm:min-w-40">
              <a href="mailto:hello@xolaceinc.com">
                <LifeBuoy aria-hidden="true" className="size-4" />
                Contact support
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
              className="sm:min-w-40"
            >
              <LogOut aria-hidden="true" className="size-4" />
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
