"use client";

import { useQuery } from "convex/react";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../../convex/_generated/api";

// An action, not a destination, so it gets no route. Promote to
// `/<role>/<uuid>/invites` once invites have history and resend state.
export function InviteDialog({
  triggerLabel,
  onOpen,
  triggerVariant = "default",
  open,
  onOpenChange,
}: {
  triggerLabel?: string;
  onOpen?: () => void;
  triggerVariant?: "default" | "sidebar";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const user = useQuery(api.users.current);
  const isControlled = open !== undefined;
  const isOpen = open ?? internalOpen;

  function handleOpenChange(next: boolean) {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);

    if (next) {
      onOpen?.();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {triggerLabel ? (
        <DialogTrigger asChild>
          <Button
            type="button"
            size="sm"
            className={
              triggerVariant === "sidebar"
                ? "mt-1 h-8 w-full justify-start gap-3 rounded-md px-3 text-left text-[14px] font-semibold text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
                : undefined
            }
            variant={triggerVariant === "sidebar" ? "ghost" : "default"}
          >
            {triggerVariant === "sidebar" ? (
              <UserPlus aria-hidden="true" className="size-4 shrink-0" />
            ) : null}
            {triggerLabel}
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send an invite</DialogTitle>
          <DialogDescription>
            Prepare an email invitation in your mail app. Portal access still
            needs to be provisioned by an admin.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="invite-email">Email address</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="you@example.com…"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
            onClick={() => {
              const referralCode = user?.referralCode;
              const applicationUrl = referralCode
                ? `${window.location.origin}/?ref=${encodeURIComponent(referralCode)}#apply`
                : `${window.location.origin}/#apply`;
              const body = `Hi,\n\nWe would love to invite you to join the Xolace Ambassadors program. Complete your application here:\n${applicationUrl}\n\nWe look forward to hearing from you.`;
              window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Xolace Ambassador Program")}&body=${encodeURIComponent(body)}`;
              handleOpenChange(false);
            }}
          >
            Open email app
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
