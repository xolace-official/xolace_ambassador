import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Settings } from "../types/settings.types";
import { SettingRow } from "./setting-row";

export function AccountSettings({
  settings,
  isSigningOut,
  onSignOut,
}: {
  settings: Settings;
  isSigningOut: boolean;
  onSignOut: () => Promise<void>;
}) {
  return (
    <section>
      <div className="space-y-5">
        <div>
          <h2 className="font-semibold text-foreground">Account & security</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage access to your Xolace portal account.
          </p>
        </div>
        <SettingRow
          label="Email address"
          value={settings.email || "Not provided"}
        />
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Password</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the password recovery flow to set a new password.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/forgot-password">Reset password</Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Sign out</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              End this session on the current device.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={isSigningOut}
            onClick={() => void onSignOut()}
            className="gap-2"
          >
            <LogOut aria-hidden="true" className="size-4" />
            {isSigningOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </div>
    </section>
  );
}
