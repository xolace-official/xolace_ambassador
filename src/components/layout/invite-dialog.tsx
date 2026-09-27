"use client";

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

// An action, not a destination, so it gets no route. Promote to
// `/<role>/<uuid>/invites` once invites have history and resend state.
export function InviteDialog({
  triggerLabel,
  onOpen,
  triggerVariant = "default",
}: {
  triggerLabel: string;
  onOpen?: () => void;
  triggerVariant?: "default" | "sidebar";
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
        <Button
          type="button"
          size="sm"
          className={
            triggerVariant === "sidebar"
              ? "h-8 w-full justify-start px-4 text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
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
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
            onClick={() => {
              const body =
                "Hi,\n\nWe would love to invite you to join the Xolace Ambassadors program. Reply to this email and we will help you get started.\n\nLearn more at xolaceinc.com.";
              window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Xolace Ambassador Program")}&body=${encodeURIComponent(body)}`;
              setOpen(false);
            }}
          >
            Open email app
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
