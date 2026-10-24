"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { CalendarClock, CheckCircle2, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../../../../../convex/_generated/api";

const meetingTimeSchema = z.object({
  meetingSlotId: z.string().min(1, "Choose a meeting time to continue"),
});

type MeetingTimeValues = z.infer<typeof meetingTimeSchema>;

export default function MeetingTimeSelectionPage() {
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [token, setToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const selection = useQuery(
    api.applications.getMeetingSlotSelection,
    token === null ? "skip" : { token, now: currentTime },
  );
  const submitSelection = useMutation(
    api.applications.submitMeetingSlotSelection,
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MeetingTimeValues>({
    resolver: zodResolver(meetingTimeSchema),
    defaultValues: { meetingSlotId: "" },
  });

  useEffect(() => {
    const hashToken = window.location.hash.slice(1);
    // Strict Mode re-runs this effect after the hash is stripped; keep the
    // token from the first run.
    setToken((current) => (hashToken === "" ? (current ?? "") : hashToken));
    // Keep the token out of history, bookmarks and copied links (AGENTS.md §8).
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    const interval = window.setInterval(
      () => setCurrentTime(Date.now()),
      60_000,
    );
    return () => window.clearInterval(interval);
  }, []);

  async function onSubmit(values: MeetingTimeValues) {
    if (token === null) return;
    try {
      await submitSelection({ token, meetingSlotId: values.meetingSlotId });
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
              <form
                className="space-y-3"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <Field data-invalid={!!errors.meetingSlotId}>
                  <FieldLabel htmlFor="meeting-slot">
                    Available meeting time
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="meetingSlotId"
                    render={({ field }) => (
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="meeting-slot"
                          ref={field.ref}
                          onBlur={field.onBlur}
                          aria-invalid={!!errors.meetingSlotId}
                          className="w-full"
                        >
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
                    )}
                  />
                  <div aria-live="polite">
                    <FieldError errors={[errors.meetingSlotId]} />
                  </div>
                </Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving…" : "Submit meeting time"}
                </Button>
              </form>
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
