export const DEFAULT_MEETING_SLOTS = [
  { id: "2026-10-27-0830", startsAt: Date.UTC(2026, 9, 27, 8, 30) },
  { id: "2026-10-27-1030", startsAt: Date.UTC(2026, 9, 27, 10, 30) },
  { id: "2026-10-28-0830", startsAt: Date.UTC(2026, 9, 28, 8, 30) },
  { id: "2026-10-29-1030", startsAt: Date.UTC(2026, 9, 29, 10, 30) },
] as const;

export function formatMeetingSlot(startsAt: number) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(startsAt));
}
