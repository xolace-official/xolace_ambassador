import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { DEFAULT_MEETING_SLOTS, formatMeetingSlot } from "./meetingSlots";
import { requireAdmin } from "./model/auth";

const applicationStatusValidator = v.union(
  v.literal("new"),
  v.literal("reviewing"),
  v.literal("accepted"),
  v.literal("rejected"),
);

const slotValidator = v.object({
  _id: v.id("meetingSlots"),
  slotKey: v.string(),
  startsAt: v.number(),
  label: v.string(),
  active: v.boolean(),
  booked: v.boolean(),
});

const meetingValidator = v.object({
  _id: v.id("applications"),
  name: v.string(),
  email: v.string(),
  imageUrl: v.union(v.string(), v.null()),
  status: applicationStatusValidator,
  meetingSlotLabel: v.union(v.string(), v.null()),
  meetingSlotStartsAt: v.union(v.number(), v.null()),
});

function toMeeting(
  application: Doc<"applications">,
  startsAtOverride?: number,
  imageUrl?: string | null,
) {
  const startsAt = startsAtOverride ?? application.meetingSlotStartsAt;
  return {
    _id: application._id,
    name: application.name,
    email: application.email,
    imageUrl: imageUrl ?? null,
    status: application.status,
    meetingSlotLabel:
      application.meetingSlotLabel ??
      (startsAt !== undefined ? formatMeetingSlot(startsAt) : null),
    meetingSlotStartsAt: startsAt ?? null,
  };
}

// The applicant photo if one was uploaded, otherwise the linked ambassador's
// avatar. Returns null when neither exists so the UI can fall back to initials.
async function resolveMeetingImage(
  ctx: Parameters<typeof requireAdmin>[0],
  application: Doc<"applications">,
) {
  if (application.image) {
    const url = await ctx.storage.getUrl(application.image);
    if (url) return url;
  }
  if (application.ambassadorId) {
    const user = await ctx.db.get(application.ambassadorId);
    if (user?.avatarStorageId) {
      return await ctx.storage.getUrl(user.avatarStorageId);
    }
    if (user?.image) return user.image;
  }
  return null;
}

// A slot key -> start time lookup, so a booking still resolves its time even
// when the application was created before `meetingSlotStartsAt` was stored.
async function slotStartMap(ctx: Parameters<typeof requireAdmin>[0]) {
  const map = new Map<string, number>();
  for (const slot of DEFAULT_MEETING_SLOTS) map.set(slot.id, slot.startsAt);
  const configured = await ctx.db.query("meetingSlots").take(200);
  for (const slot of configured) map.set(slot.slotKey, slot.startsAt);
  return map;
}

function resolveStartsAt(
  application: Doc<"applications">,
  map: Map<string, number>,
) {
  if (application.meetingSlotStartsAt !== undefined) {
    return application.meetingSlotStartsAt;
  }
  return application.meetingSlotId
    ? map.get(application.meetingSlotId)
    : undefined;
}

// A booking is only a meeting once an admin has scheduled it. Merely choosing a
// slot on the application form reserves the slot but is not a meeting yet.
function isScheduled(application: Doc<"applications">) {
  return (
    application.meetingScheduledAt !== undefined &&
    application.status !== "rejected"
  );
}

// Populates `meetingSlotStartsAt` for applications created before the field
// existed, so the time-indexed meeting queries include them.
export const backfillMeetingTimes = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const map = await slotStartMap(ctx);
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_meetingSlotId")
      .take(1000);
    let updated = 0;
    for (const application of applications) {
      if (application.meetingSlotStartsAt !== undefined) continue;
      const startsAt = resolveStartsAt(application, map);
      if (startsAt === undefined) continue;
      await ctx.db.patch(application._id, {
        meetingSlotStartsAt: startsAt,
        meetingSlotLabel:
          application.meetingSlotLabel ?? formatMeetingSlot(startsAt),
      });
      updated += 1;
    }
    return updated;
  },
});

export const adminEnsureDefaults = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db.query("meetingSlots").take(100);
    if (existing.length > 0) return existing.length;

    for (const slot of DEFAULT_MEETING_SLOTS) {
      await ctx.db.insert("meetingSlots", {
        slotKey: slot.id,
        startsAt: slot.startsAt,
        active: true,
        createdBy: admin._id,
      });
    }
    return DEFAULT_MEETING_SLOTS.length;
  },
});

export const adminListSlots = query({
  args: {},
  returns: v.array(slotValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const slots = await ctx.db
      .query("meetingSlots")
      .withIndex("by_startsAt")
      .order("asc")
      .take(200);
    return await Promise.all(
      slots.map(async (slot) => {
        const booking = await ctx.db
          .query("applications")
          .withIndex("by_meetingSlotId", (q) =>
            q.eq("meetingSlotId", slot.slotKey),
          )
          .first();
        return {
          _id: slot._id,
          slotKey: slot.slotKey,
          startsAt: slot.startsAt,
          label: formatMeetingSlot(slot.startsAt),
          active: slot.active,
          booked:
            booking?.status !== undefined && booking.status !== "rejected",
        };
      }),
    );
  },
});

export const adminCreateSlot = mutation({
  args: { startsAt: v.number() },
  returns: v.id("meetingSlots"),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (!Number.isFinite(args.startsAt) || args.startsAt <= Date.now()) {
      throw new Error("Choose a future meeting time.");
    }
    const slotKey = `slot-${args.startsAt}`;
    const existing = await ctx.db
      .query("meetingSlots")
      .withIndex("by_slotKey", (q) => q.eq("slotKey", slotKey))
      .first();
    if (existing !== null) throw new Error("That meeting time already exists.");
    return await ctx.db.insert("meetingSlots", {
      slotKey,
      startsAt: args.startsAt,
      active: true,
      createdBy: admin._id,
    });
  },
});

export const adminToggleSlot = mutation({
  args: { slotId: v.id("meetingSlots"), active: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const slot = await ctx.db.get(args.slotId);
    if (slot === null) throw new Error("Meeting slot not found.");
    if (!args.active) {
      const booking = await ctx.db
        .query("applications")
        .withIndex("by_meetingSlotId", (q) =>
          q.eq("meetingSlotId", slot.slotKey),
        )
        .first();
      if (booking?.status !== undefined && booking.status !== "rejected") {
        throw new Error("A booked meeting slot cannot be disabled.");
      }
    }
    await ctx.db.patch(args.slotId, { active: args.active });
    return null;
  },
});

// Meetings happening today, for the "today" card on the meetings page.
export const adminTodayMeetings = query({
  args: { startOfDay: v.number(), endOfDay: v.number() },
  returns: v.array(meetingValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const map = await slotStartMap(ctx);
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_meetingSlotId")
      .take(500);
    return await Promise.all(
      applications
        .map((application) => ({
          application,
          startsAt: resolveStartsAt(application, map),
        }))
        .filter(
          ({ application, startsAt }) =>
            isScheduled(application) &&
            startsAt !== undefined &&
            startsAt >= args.startOfDay &&
            startsAt < args.endOfDay,
        )
        .sort((a, b) => (a.startsAt ?? 0) - (b.startsAt ?? 0))
        .map(async ({ application, startsAt }) =>
          toMeeting(
            application,
            startsAt,
            await resolveMeetingImage(ctx, application),
          ),
        ),
    );
  },
});

// The next few upcoming meetings, excluding anything already in the past.
export const adminUpcomingMeetings = query({
  args: { now: v.number(), limit: v.optional(v.number()) },
  returns: v.array(meetingValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const map = await slotStartMap(ctx);
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_meetingSlotId")
      .take(500);
    return await Promise.all(
      applications
        .map((application) => ({
          application,
          startsAt: resolveStartsAt(application, map),
        }))
        .filter(
          ({ application, startsAt }) =>
            isScheduled(application) &&
            startsAt !== undefined &&
            startsAt > args.now,
        )
        .sort((a, b) => (a.startsAt ?? 0) - (b.startsAt ?? 0))
        .slice(0, Math.min(args.limit ?? 5, 20))
        .map(async ({ application, startsAt }) =>
          toMeeting(
            application,
            startsAt,
            await resolveMeetingImage(ctx, application),
          ),
        ),
    );
  },
});

export const adminAllMeetings = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(applicationStatusValidator),
  },
  returns: paginationResultValidator(meetingValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { status } = args;
    const result = await ctx.db
      .query("applications")
      .withIndex("by_meetingScheduledAt")
      .order("desc")
      .paginate(args.paginationOpts);
    return {
      ...result,
      page: await Promise.all(
        result.page
          .filter(
            (application) =>
              isScheduled(application) &&
              (status === undefined || application.status === status),
          )
          .map(async (application) =>
            toMeeting(
              application,
              undefined,
              await resolveMeetingImage(ctx, application),
            ),
          ),
      ),
    };
  },
});
