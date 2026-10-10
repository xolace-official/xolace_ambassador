"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowRight, CalendarDays, Clock, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { PageDescription } from "@/components/shared/page-description";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "../../../../../../convex/_generated/api";
import { AddSlotDialog } from "../components/add-slot-dialog";

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeStyle: "short",
  timeZone: "UTC",
});

function startOfUtcDay(timestamp: number) {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function AdminMeetings({ uuid }: { uuid: string }) {
  const [now, setNow] = useState(() => Date.now());
  const today = startOfUtcDay(now);
  const tomorrow = today + 86_400_000;

  const todayMeetings = useQuery(api.meetings.adminTodayMeetings, {
    startOfDay: today,
    endOfDay: tomorrow,
  });
  const upcoming = useQuery(api.meetings.adminUpcomingMeetings, { now });
  const slots = useQuery(api.meetings.adminListSlots);
  const ensureDefaults = useMutation(api.meetings.adminEnsureDefaults);
  const toggleSlot = useMutation(api.meetings.adminToggleSlot);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (slots?.length === 0) {
      void ensureDefaults().catch(() => undefined);
    }
  }, [slots, ensureDefaults]);

  const joinUrl = process.env.NEXT_PUBLIC_MEETING_URL;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageDescription page="adminMeetings" className="max-w-2xl" />
        <AddSlotDialog />
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <Clock
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
            <h2 className="font-semibold text-foreground">Today</h2>
          </div>
          {todayMeetings?.length ? (
            <ul className="divide-y divide-border">
              {todayMeetings.map((meeting) => (
                <li
                  key={meeting._id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {meeting.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {meeting.meetingSlotStartsAt
                        ? timeFormat.format(
                            new Date(meeting.meetingSlotStartsAt),
                          )
                        : "No time"}{" "}
                      UTC · {countdownLabel(meeting.meetingSlotStartsAt, now)}
                    </p>
                  </div>
                  {joinUrl ? (
                    <Button asChild size="sm">
                      <a
                        href={joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Video aria-hidden="true" className="size-4" />
                        Join meeting
                      </a>
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Nothing booked for today"
              description="Meetings you schedule for today will show up here with a join link."
            />
          )}
        </Card>

        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
              <h2 className="font-semibold text-foreground">
                Upcoming meetings
              </h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/admin/${uuid}/meetings/all`}>
                See all
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
          {upcoming?.length ? (
            <ul className="divide-y divide-border">
              {upcoming.map((meeting) => (
                <li key={meeting._id} className="flex items-start gap-3 py-3.5">
                  {meeting.imageUrl ? (
                    <Image
                      src={meeting.imageUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="size-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                    >
                      {initials(meeting.name)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-foreground">
                        {meeting.name}
                      </p>
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {meeting.status}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock aria-hidden="true" className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {meeting.meetingSlotLabel ?? "No slot"}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">
              No upcoming meetings. New bookings will appear here.
            </p>
          )}
        </Card>
      </div>

      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-foreground">Available slots</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/${uuid}/meetings/slots`}>
              See all
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
        {slots?.length ? (
          <ul className="divide-y divide-border">
            {slots.slice(0, 5).map((slot) => (
              <li
                key={slot._id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="truncate text-sm">
                    {dateTimeFormat.format(new Date(slot.startsAt))} UTC
                  </span>
                  {slot.booked ? (
                    <Badge variant="secondary">Booked</Badge>
                  ) : slot.active ? (
                    <Badge variant="outline">Open</Badge>
                  ) : (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={slot.booked}
                  onClick={() => {
                    void toggleSlot({
                      slotId: slot._id,
                      active: !slot.active,
                    }).catch((error: unknown) => {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Could not update the slot.",
                      );
                    });
                  }}
                >
                  {slot.active ? "Disable" : "Enable"}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            No availability yet. Add a slot to let ambassadors book a meeting.
          </p>
        )}
      </Card>
    </div>
  );
}

function countdownLabel(startsAt: number | null, now: number) {
  if (!startsAt) return "No time set";
  const diff = startsAt - now;
  if (diff <= 0) return "Happening now";
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `in ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `in ${hours}h ${remaining}m` : `in ${hours}h`;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
