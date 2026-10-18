"use client";

import { Bell, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Preferences = {
  mission: boolean;
  review: boolean;
  reward: boolean;
  resource: boolean;
  community: boolean;
};

const preferenceItems = [
  {
    key: "mission",
    label: "Mission updates",
    description: "New and changed missions.",
  },
  {
    key: "review",
    label: "Review updates",
    description: "Approvals and feedback on contributions.",
  },
  {
    key: "reward",
    label: "Reward updates",
    description: "Points, recognition, and redemption decisions.",
  },
  {
    key: "resource",
    label: "Resource updates",
    description: "New resources shared by the program team.",
  },
  {
    key: "community",
    label: "Community updates",
    description: "Community announcements when this feature is available.",
  },
] as const;

export function NotificationPreferences({
  preferences,
  onSave,
}: {
  preferences: Preferences;
  onSave: (preferences: Preferences) => Promise<void>;
}) {
  const [draft, setDraft] = useState(preferences);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(preferences), [preferences]);

  async function save() {
    setSaving(true);
    try {
      await onSave(draft);
      toast.success("Notification preferences saved.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save preferences.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-semibold text-foreground">
          Notification preferences
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Choose which updates should appear in your notification panel.
        </p>
      </div>
      <div className="divide-y divide-border rounded-xl border border-border">
        {preferenceItems.map((item) => {
          const enabled = draft[item.key];
          return (
            <label
              key={item.key}
              className="flex cursor-pointer items-center gap-3 p-4 sm:p-5"
            >
              <input
                type="checkbox"
                checked={enabled}
                onChange={() =>
                  setDraft((current) => ({
                    ...current,
                    [item.key]: !current[item.key],
                  }))
                }
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex size-5 shrink-0 items-center justify-center rounded border ${enabled ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}
              >
                {enabled ? <Check className="size-3.5" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Bell
                    aria-hidden="true"
                    className="size-3.5 text-muted-foreground"
                  />
                  {item.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <Button type="button" disabled={saving} onClick={() => void save()}>
        {saving ? "Saving…" : "Save preferences"}
      </Button>
    </section>
  );
}
