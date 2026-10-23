"use client";

import { useMutation, useQuery } from "convex/react";
import { CalendarClock, CheckCircle2, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../../../../../convex/_generated/api";

export default function MeetingTimeSelectionPage() {
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [token, setToken] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const selection = useQuery(
    api.applications.getMeetingSlotSelection,
    token === null ? "skip" : { token, now: currentTime },
  );
  const submitSelection = useMutation(
    api.applications.submitMeetingSlotSelection,
  );

  useEffect(() => {
    setToken(window.location.hash.slice(1));
    const interval = window.setInterval(
      () => setCurrentTime(Date.now()),
      60_000,
    );
    return () => window.clearInterval(interval);
  }, []);

  async function submit() {
    if (!selectedSlotId || token === null) return;
    try {
      await submitSelection({ token, meetingSlotId: selectedSlotId });
      setSubmitted(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save your meeting time.",
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-xl gap-0 p-6 sm:p-10">
        {submitted ? (
          <div className="space-y-5 text-center" aria-live="polite">
            <CheckCircle2
              aria-hidden="true"
              className="mx-auto size-12 text-success"
            />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">
                Meeting time saved
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Thank you. The Xolace Ambassadors team will use your selected
                time for the next step of your application.
              </p>
            </div>
          </div>
        ) : selection === undefined ? (
          <p
            className="text-center text-sm text-muted-foreground"
            aria-live="polite"
          >
            Loading available meeting times…
          </p>
        ) : selection.status === "expired" ? (
          <Message
            title="This link has expired"
            description="Ask the Xolace Ambassadors team to send you a new meeting-time link."
          />
        ) : selection.status === "completed" ? (
          <Message
            title="Meeting time already submitted"
            description="This link has already been used. Contact the Xolace Ambassadors team if you need to make another change."
          />
        ) : (
          <div className="space-y-7">
            <div className="space-y-3">
              <CalendarClock
                aria-hidden="true"
                className="size-10 text-primary"
              />
              <div className="space-y-2">
                <p className="text-sm font-medium text-primary">
                  Xolace Ambassadors
                </p>
                <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                  Choose your meeting time, {selection.name}
                </h1>
                <p className="text-sm leading-6 text-muted-foreground">
                  Select one available time below. Times are shown in UTC and
                  are available at least five hours from now.
                </p>
              </div>
            </div>

            {selection.slots.length === 0 ? (
              <div
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground"
                aria-live="polite"
              >
                <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>
                  No meeting times are available right now. Please check back
                  later using this same link.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <label
                  htmlFor="meeting-slot"
                  className="text-sm font-medium text-foreground"
                >
                  Available meeting time
                </label>
                <Select
                  value={selectedSlotId}
                  onValueChange={setSelectedSlotId}
                >
                  <SelectTrigger id="meeting-slot" className="w-full">
                    <SelectValue placeholder="Choose a meeting time…" />
                  </SelectTrigger>
                  <SelectContent>
                    {selection.slots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.label} UTC
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  className="w-full"
                  disabled={!selectedSlotId}
                  onClick={() => void submit()}
                >
                  Submit meeting time
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </main>
  );
}

function Message({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3 text-center" aria-live="polite">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
