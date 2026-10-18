import type { MutationCtx, QueryCtx } from "../_generated/server";

// Statuses that hold a meeting slot. A rejected application releases its slot.
const BOOKING_STATUSES = ["new", "reviewing", "accepted"] as const;

// A slot can accumulate several applications over time (each rejection frees it
// for the next applicant), so check for any live booking rather than reading
// only the oldest row for the slot.
export async function isMeetingSlotBooked(
  ctx: QueryCtx | MutationCtx,
  slotKey: string,
) {
  for (const status of BOOKING_STATUSES) {
    const booking = await ctx.db
      .query("applications")
      .withIndex("by_meetingSlotId_and_status", (q) =>
        q.eq("meetingSlotId", slotKey).eq("status", status),
      )
      .first();
    if (booking !== null) return true;
  }
  return false;
}
