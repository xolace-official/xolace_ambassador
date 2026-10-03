import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Settings } from "../types/settings.types";
import { formatSettingsLabel as formatLabel } from "./format-settings-label";
import { SettingRow } from "./setting-row";

export function ProgramSettings({
  settings,
  onAcknowledge,
}: {
  settings: Settings;
  onAcknowledge: () => Promise<void>;
}) {
  return (
    <section>
      <div className="space-y-5">
        <div>
          <h2 className="font-semibold text-foreground">Program & safety</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your place in the program and the commitments that keep the
            community safe.
          </p>
        </div>
        <SettingRow
          label="Account role"
          value={settings.role === "ambassador" ? "Ambassador" : "Admin"}
        />
        {settings.role === "ambassador" ? (
          <>
            <SettingRow
              label="Track"
              value={settings.program?.track || "Not assigned"}
            />
            <SettingRow
              label="Pod"
              value={settings.program?.podName || "Not assigned"}
            />
            <SettingRow
              label="Program status"
              value={formatLabel(settings.program?.status || "active")}
            />
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-primary"
                />
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground">
                    Safety acknowledgement
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Xolace ambassadors help create respectful spaces for honest
                    conversations. Acknowledge the program safety guidance
                    before submitting contributions.
                  </p>
                  {settings.program?.safetyAcknowledgedAt ? (
                    <p className="mt-3 flex items-center gap-2 text-sm font-medium text-success">
                      <CheckCircle2 aria-hidden="true" className="size-4" />
                      Completed
                    </p>
                  ) : (
                    <Button
                      type="button"
                      className="mt-4"
                      onClick={() => void onAcknowledge()}
                    >
                      I acknowledge the guidance
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <p className="border-t border-border pt-5 text-sm leading-6 text-muted-foreground">
              Your track, pod, and program status are managed by the Xolace team
              so your program records stay accurate. Contact an admin if
              something needs updating.
            </p>
          </>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Admin access is managed by the Xolace team.
          </p>
        )}
      </div>
    </section>
  );
}
