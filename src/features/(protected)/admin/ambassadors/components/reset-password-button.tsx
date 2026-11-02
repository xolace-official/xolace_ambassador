"use client";

import { useAction } from "convex/react";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export function ResetPasswordButton({
  ambassadorId,
  email,
}: {
  ambassadorId: Id<"users">;
  email: string;
}) {
  const resetPassword = useAction(api.passwordReset.adminResetPassword);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirmReset() {
    setBusy(true);
    try {
      const emailed = await resetPassword({ ambassadorId });
      if (emailed) {
        toast.success("Password reset. A temporary password was emailed.");
      } else {
        toast.warning(
          "The password was reset, but the email could not be sent. Reset again shortly to issue a new one.",
        );
      }
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not reset the password.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <KeyRound aria-hidden="true" />
        Reset password
      </Button>
      <Dialog open={open} onOpenChange={(next) => !busy && setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset this ambassador&apos;s password?</DialogTitle>
            <DialogDescription>
              Their current password stops working and they are signed out
              everywhere. A temporary password is emailed to{" "}
              <span className="break-all">{email}</span>, and they must choose a
              new one when they next sign in. Only do this after confirming the
              request really came from them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmReset()}
              disabled={busy}
            >
              {busy ? "Resetting…" : "Reset password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
