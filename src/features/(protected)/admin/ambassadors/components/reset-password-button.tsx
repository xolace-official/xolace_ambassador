"use client";

import { useAction } from "convex/react";
import { Copy, KeyRound } from "lucide-react";
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

type ResetResult = { temporaryPassword: string; emailed: boolean };

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
  // Held only while the dialog is open: closing it is the last time the admin
  // can see the password.
  const [result, setResult] = useState<ResetResult | null>(null);

  function close() {
    setOpen(false);
    setResult(null);
  }

  async function confirmReset() {
    setBusy(true);
    try {
      setResult(await resetPassword({ ambassadorId }));
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

  async function copyPassword(password: string) {
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Temporary password copied.");
    } catch {
      toast.error("Could not copy. Select the password and copy it instead.");
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
      <Dialog open={open} onOpenChange={(next) => !busy && !next && close()}>
        <DialogContent>
          {result === null ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  Reset this ambassador&apos;s password?
                </DialogTitle>
                <DialogDescription>
                  Their current password stops working and they are signed out
                  everywhere. You&apos;ll see a temporary password to pass on to
                  them, and it is also emailed to{" "}
                  <span className="break-all">{email}</span>. They must choose a
                  new one when they next sign in. Only do this after confirming
                  the request really came from them.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={close}
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
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Password reset</DialogTitle>
                <DialogDescription>
                  {result.emailed
                    ? "The temporary password was also emailed to them. "
                    : "The email could not be sent, so pass this on yourself. "}
                  Share it through a channel you trust. It won&apos;t be shown
                  again once you close this.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
                <span className="sr-only">Temporary password:</span>
                <code className="flex-1 select-all break-all font-mono text-sm text-foreground">
                  {result.temporaryPassword}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void copyPassword(result.temporaryPassword)}
                >
                  <Copy aria-hidden="true" />
                  Copy
                </Button>
              </div>
              <DialogFooter>
                <Button type="button" onClick={close}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
