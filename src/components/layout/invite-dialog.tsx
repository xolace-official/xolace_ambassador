"use client";

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

// An action, not a destination, so it gets no route. Promote to
// `/<role>/<uuid>/invites` once invites have history and resend state.
export function InviteDialog({
  triggerLabel,
  onOpen,
}: {
  triggerLabel: string;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  function handleOpenChange(next: boolean) {
    setOpen(next);

    if (next) {
      onOpen?.();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-left text-foreground/80 transition-colors hover:text-foreground"
        >
          {triggerLabel}
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send an invite</DialogTitle>
          <DialogDescription>
            Invite someone to the Xolace Ambassadors program. They&apos;ll get
            an email to set up their portal access.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="invite-email">Email address</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => setOpen(false)}
            disabled={!email}
          >
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
