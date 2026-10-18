"use client";

import { useMutation } from "convex/react";
import { CalendarPlus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { api } from "../../../../../../convex/_generated/api";

function todayUtcInput() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
    .toISOString()
    .slice(0, 10);
}

export function AddSlotDialog() {
  const createSlot = useMutation(api.meetings.adminCreateSlot);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const minDate = todayUtcInput();

  async function addSlot() {
    if (!date || !time) return;
    const startsAt = Date.parse(`${date}T${time}:00Z`);
    if (!Number.isFinite(startsAt)) {
      toast.error("Pick a valid date and time.");
      return;
    }
    if (startsAt <= Date.now()) {
      toast.error("Pick a time in the future.");
      return;
    }
    setSaving(true);
    try {
      await createSlot({ startsAt });
      setDate("");
      setTime("");
      setOpen(false);
      toast.success("Meeting slot added.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not add the slot.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <CalendarPlus aria-hidden="true" className="size-4" />
        Add availability
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-3xl">
          <DialogHeader>
            <DialogTitle>Add availability</DialogTitle>
            <DialogDescription>
              Add a future time ambassadors can book. Times are shown in UTC.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <label htmlFor="slot-date" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="slot-date"
                type="date"
                min={minDate}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="slot-time" className="text-sm font-medium">
                Time (UTC)
              </label>
              <Input
                id="slot-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void addSlot()}
              disabled={saving || !date || !time}
            >
              {saving ? "Adding…" : "Add slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
