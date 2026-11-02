import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { ConvexError, type Infer, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  type MutationCtx,
  mutation,
  query,
} from "./_generated/server";
import { missionSetActiveEmail } from "./emailTemplates";
import { requireAdmin, requireRole } from "./model/auth";
import { EMAIL_LOGO_URL, trySendEmailBatch } from "./model/email";
import { trackValidator } from "./schema";

// Keeps the email scannable; the portal has the full list.
const MAX_EMAILED_MISSIONS = 6;

const setStatus = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("published_next"),
  v.literal("closed"),
);

const missionSetValidator = v.object({
  _id: v.id("missionSets"),
  _creationTime: v.number(),
  name: v.string(),
  description: v.union(v.string(), v.null()),
  status: setStatus,
  startsAt: v.number(),
  endsAt: v.number(),
  createdBy: v.id("users"),
  announcedAt: v.optional(v.number()),
  createdByName: v.string(),
  missionCount: v.number(),
});

export const adminList = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(missionSetValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const result = await ctx.db
      .query("missionSets")
      .withIndex("by_startsAt")
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page.map(async (missionSet) => {
        const creator = await ctx.db.get(missionSet.createdBy);
        const missions = await ctx.db
          .query("missions")
          .withIndex("by_missionSetId", (q) =>
            q.eq("missionSetId", missionSet._id),
          )
          .take(500);

        return {
          ...missionSet,
          description: missionSet.description ?? null,
          createdByName: creator?.name?.trim() || "Former admin",
          missionCount: missions.length,
        };
      }),
    );

    return {
      ...result,
      page,
    };
  },
});

export const listForAmbassador = query({
  args: { now: v.number() },
  returns: v.array(
    v.object({
      _id: v.id("missionSets"),
      name: v.string(),
      startsAt: v.number(),
      endsAt: v.number(),
      isCurrent: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireRole(ctx);
    const published = await ctx.db
      .query("missionSets")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(100);
    const active = published
      .filter(
        (missionSet) =>
          missionSet.startsAt <= args.now && missionSet.endsAt >= args.now,
      )
      .sort((a, b) => b.startsAt - a.startsAt)[0];
    const recent = published
      .filter((missionSet) => missionSet.startsAt <= args.now)
      .sort((a, b) => b.startsAt - a.startsAt)
      .filter((missionSet) => missionSet._id !== active?._id)
      .slice(0, 1);
    const selectable =
      active === undefined ? recent.slice(0, 1) : [active, ...recent];

    return selectable.map((missionSet) => ({
      _id: missionSet._id,
      name: missionSet.name,
      startsAt: missionSet.startsAt,
      endsAt: missionSet.endsAt,
      isCurrent: missionSet._id === active?._id,
    }));
  },
});

export const adminCreate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: setStatus,
    startsAt: v.number(),
    endsAt: v.number(),
  },
  returns: v.id("missionSets"),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const name = args.name.trim();
    const description = args.description?.trim();

    if (name.length < 3 || name.length > 160) {
      throw new Error("Enter a set name between 3 and 160 characters.");
    }
    if (!Number.isFinite(args.startsAt) || !Number.isFinite(args.endsAt)) {
      throw new Error("Choose valid start and end times.");
    }
    if (args.endsAt <= args.startsAt) {
      throw new Error("Choose an end time after the start time.");
    }
    await assertNoActiveSet(ctx, args.status, null, args.startsAt, args.endsAt);

    const missionSetId = await ctx.db.insert("missionSets", {
      name,
      description: description || undefined,
      status: args.status,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      createdBy: admin._id,
    });
    await announceIfActive(ctx, missionSetId);
    await scheduleFutureAnnouncement(ctx, missionSetId);
    return missionSetId;
  },
});

export const adminGet = query({
  args: { missionSetId: v.string() },
  returns: v.union(missionSetValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const id = ctx.db.normalizeId("missionSets", args.missionSetId);
    if (id === null) return null;

    const missionSet = await ctx.db.get(id);
    if (missionSet === null) return null;

    const creator = await ctx.db.get(missionSet.createdBy);
    const missions = await ctx.db
      .query("missions")
      .withIndex("by_missionSetId", (q) => q.eq("missionSetId", missionSet._id))
      .take(500);

    return {
      ...missionSet,
      description: missionSet.description ?? null,
      createdByName: creator?.name?.trim() || "Former admin",
      missionCount: missions.length,
    };
  },
});

export const adminUpdate = mutation({
  args: {
    missionSetId: v.id("missionSets"),
    name: v.string(),
    description: v.optional(v.string()),
    status: setStatus,
    startsAt: v.number(),
    endsAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const missionSet = await ctx.db.get(args.missionSetId);
    if (missionSet === null) throw new Error("Mission set not found.");

    const name = args.name.trim();
    if (name.length < 3 || name.length > 160) {
      throw new Error("Enter a set name between 3 and 160 characters.");
    }
    if (!Number.isFinite(args.startsAt) || !Number.isFinite(args.endsAt)) {
      throw new Error("Choose valid start and end times.");
    }
    if (args.endsAt <= args.startsAt) {
      throw new Error("Choose an end time after the start time.");
    }
    await assertNoActiveSet(
      ctx,
      args.status,
      args.missionSetId,
      args.startsAt,
      args.endsAt,
    );

    await ctx.db.patch(args.missionSetId, {
      name,
      description: args.description?.trim() || undefined,
      status: args.status,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
    });
    await announceIfActive(ctx, args.missionSetId);
    await scheduleFutureAnnouncement(ctx, args.missionSetId);
    return null;
  },
});

export const adminDelete = mutation({
  args: { missionSetId: v.id("missionSets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const missionSet = await ctx.db.get(args.missionSetId);
    if (missionSet === null) throw new Error("Mission set not found.");

    const mission = await ctx.db
      .query("missions")
      .withIndex("by_missionSetId", (q) =>
        q.eq("missionSetId", args.missionSetId),
      )
      .first();
    if (mission !== null) {
      throw new Error(
        "Move or delete the missions in this set before deleting it.",
      );
    }

    await ctx.db.delete(args.missionSetId);
    return null;
  },
});

async function assertNoActiveSet(
  ctx: MutationCtx,
  status: "draft" | "published" | "published_next" | "closed",
  currentId: string | null,
  startsAt: number,
  endsAt: number,
) {
  if (status !== "published") return;

  const publishedSets = await ctx.db
    .query("missionSets")
    .withIndex("by_status", (q) => q.eq("status", "published"))
    .take(100);
  const activeSet = publishedSets.find(
    (missionSet) =>
      missionSet._id !== currentId &&
      missionSet.startsAt < endsAt &&
      startsAt < missionSet.endsAt,
  );

  if (activeSet !== undefined) {
    throw new ConvexError("Only one mission set can be active at a time.");
  }
}

export const promoteNextSet = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now();
    const publishedSets = await ctx.db
      .query("missionSets")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(100);
    const activeSets = publishedSets.filter(
      (missionSet) => missionSet.startsAt <= now && missionSet.endsAt >= now,
    );

    // A set saved as published with a future start goes live here, not on save.
    if (activeSets.length > 0) {
      for (const missionSet of activeSets) {
        await announceIfActive(ctx, missionSet._id);
      }
      return null;
    }

    const nextSets = await ctx.db
      .query("missionSets")
      .withIndex("by_status", (q) => q.eq("status", "published_next"))
      .take(100);
    const nextSet = nextSets
      .filter(
        (missionSet) => missionSet.startsAt <= now && missionSet.endsAt >= now,
      )
      .sort((a, b) => a.startsAt - b.startsAt)[0];

    if (nextSet !== undefined) {
      await ctx.db.patch(nextSet._id, { status: "published" });
      await announceIfActive(ctx, nextSet._id);
    }

    return null;
  },
});

// One-time backfill for sets that were already live before `announcedAt`
// existed. Without it the first promoteNextSet tick after deploy would
// re-announce them to every ambassador. Marks them as announced without
// notifying; safe to re-run, since sets already marked are skipped.
// Run right after deploying: npx convex run missionSets:backfillAnnouncedAt
export const backfillAnnouncedAt = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const now = Date.now();
    const publishedSets = await ctx.db
      .query("missionSets")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(100);
    const unannouncedActiveSets = publishedSets.filter(
      (missionSet) =>
        missionSet.announcedAt === undefined &&
        missionSet.startsAt <= now &&
        missionSet.endsAt >= now,
    );

    for (const missionSet of unannouncedActiveSets) {
      await ctx.db.patch(missionSet._id, { announcedAt: missionSet.startsAt });
    }
    return unannouncedActiveSets.length;
  },
});

export const adminAdoptLegacyMissions = mutation({
  args: {},
  returns: v.union(v.id("missionSets"), v.null()),
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    const legacyMissions = (await ctx.db.query("missions").take(500)).filter(
      (mission) => mission.missionSetId === undefined,
    );

    if (legacyMissions.length === 0) return null;

    const startsAt = Math.min(
      ...legacyMissions.map((mission) => mission.startsAt),
    );
    const endsAt = Math.max(...legacyMissions.map((mission) => mission.endsAt));
    const existing = await ctx.db
      .query("missionSets")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", admin._id))
      .take(100);
    const legacySet = existing.find(
      (missionSet) => missionSet.name === "All Display Missions",
    );
    const setId =
      legacySet?._id ??
      (await ctx.db.insert("missionSets", {
        name: "All Display Missions",
        description: "Existing missions grouped into the original mission set.",
        status: "published",
        startsAt,
        endsAt,
        createdBy: admin._id,
      }));

    for (const mission of legacyMissions) {
      await ctx.db.patch(mission._id, { missionSetId: setId });
    }

    return setId;
  },
});

// The cron only ticks once a minute, so a short window could open and close
// between ticks. Schedule the go-live announcement for the exact start time;
// announceIfActive re-checks status and window when it fires, and announcedAt
// plus per-recipient delivery rows keep it from notifying anyone twice, so
// a job left stale by a later edit is a no-op.
async function scheduleFutureAnnouncement(
  ctx: MutationCtx,
  missionSetId: Id<"missionSets">,
) {
  const missionSet = await ctx.db.get(missionSetId);
  if (
    missionSet === null ||
    missionSet.status !== "published" ||
    missionSet.announcedAt !== undefined ||
    missionSet.startsAt <= Date.now()
  ) {
    return;
  }
  await ctx.scheduler.runAt(
    missionSet.startsAt,
    internal.missionSets.announceScheduledSet,
    { missionSetId },
  );
}

export const announceScheduledSet = internalMutation({
  args: { missionSetId: v.id("missionSets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await announceIfActive(ctx, args.missionSetId);
    return null;
  },
});

async function announceIfActive(
  ctx: MutationCtx,
  missionSetId: Id<"missionSets">,
) {
  const missionSet = await ctx.db.get(missionSetId);
  const now = Date.now();
  if (
    missionSet === null ||
    missionSet.status !== "published" ||
    missionSet.startsAt > now ||
    missionSet.endsAt < now
  ) {
    return;
  }

  if (missionSet.announcedAt === undefined) {
    await ctx.db.patch(missionSetId, { announcedAt: now });
    await ctx.runMutation(internal.notifications.createForAmbassadors, {
      kind: "mission",
      title: "A new mission set is available",
      description: `${missionSet.name} is now open for contributions.`,
      href: "/missions",
    });
    await queueActiveSetEmails(ctx, missionSetId, now);
  }

  // `announcedAt` only gates the in-app notification. Email delivery is
  // tracked per recipient, so the cron keeps retrying unsent recipients while
  // the set is live without re-emailing anyone already reached. Sending needs
  // `fetch`, which a mutation cannot do, so it runs in an action after this
  // write commits.
  if (await hasDueEmailDeliveries(ctx, missionSetId, now)) {
    await ctx.scheduler.runAfter(0, internal.missionSets.sendActiveSetEmails, {
      missionSetId,
    });
  }
}

// Retry failed sends after 5, 10, 20 and 40 minutes, then give up.
const MAX_EMAIL_ATTEMPTS = 5;
const EMAIL_RETRY_BASE_MS = 5 * 60 * 1000;
// Longer than an action can run, so a claimed recipient is only re-sent
// once the send that claimed it has certainly stopped.
const EMAIL_SEND_LEASE_MS = 15 * 60 * 1000;
const EMAIL_CLAIM_LIMIT = 500;

async function emailRecipient(ctx: MutationCtx, user: Doc<"users"> | null) {
  if (user === null || user.role !== "ambassador" || !user.email) return null;
  if (user.notificationPreferences?.mission === false) return null;
  const profile = await ctx.db
    .query("ambassadorProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .first();
  // Only active ambassadors; an account with no profile is not active yet.
  if (profile?.status !== "active") return null;
  return {
    userId: user._id,
    name: user.name?.trim() || "there",
    email: user.email,
    track: profile.track ?? null,
  };
}

// Fixes the recipient list at go-live: one pending delivery per ambassador.
async function queueActiveSetEmails(
  ctx: MutationCtx,
  missionSetId: Id<"missionSets">,
  now: number,
) {
  const ambassadors = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "ambassador"))
    .take(500);
  for (const ambassador of ambassadors) {
    if ((await emailRecipient(ctx, ambassador)) === null) continue;
    await ctx.db.insert("missionSetEmailDeliveries", {
      missionSetId,
      userId: ambassador._id,
      status: "pending",
      attempts: 0,
      nextAttemptAt: now,
    });
  }
}

async function dueEmailDeliveries(
  ctx: MutationCtx,
  missionSetId: Id<"missionSets">,
  now: number,
  limit: number,
) {
  const due: Doc<"missionSetEmailDeliveries">[] = [];
  // `pending` rows are waiting for their next attempt; `sending` rows whose
  // lease has expired belong to a send that was interrupted.
  for (const status of ["pending", "sending"] as const) {
    if (due.length >= limit) break;
    const rows = await ctx.db
      .query("missionSetEmailDeliveries")
      .withIndex("by_missionSetId_and_status_and_nextAttemptAt", (q) =>
        q
          .eq("missionSetId", missionSetId)
          .eq("status", status)
          .lte("nextAttemptAt", now),
      )
      .take(limit - due.length);
    due.push(...rows);
  }
  return due;
}

async function hasDueEmailDeliveries(
  ctx: MutationCtx,
  missionSetId: Id<"missionSets">,
  now: number,
) {
  return (await dueEmailDeliveries(ctx, missionSetId, now, 1)).length > 0;
}

const emailClaimValidator = v.object({
  name: v.string(),
  startsAt: v.number(),
  endsAt: v.number(),
  missions: v.array(
    v.object({
      title: v.string(),
      tracks: v.array(trackValidator),
    }),
  ),
  recipients: v.array(
    v.object({
      deliveryId: v.id("missionSetEmailDeliveries"),
      userId: v.id("users"),
      name: v.string(),
      email: v.string(),
      track: v.union(trackValidator, v.null()),
    }),
  ),
});

// Atomically marks due deliveries as `sending`, so overlapping sends never
// pick up the same recipient.
export const claimActiveSetEmails = internalMutation({
  args: { missionSetId: v.id("missionSets") },
  returns: v.union(emailClaimValidator, v.null()),
  handler: async (ctx, args) => {
    const missionSet = await ctx.db.get(args.missionSetId);
    const now = Date.now();
    // Stop emailing once the set is no longer live.
    if (
      missionSet === null ||
      missionSet.status !== "published" ||
      missionSet.startsAt > now ||
      missionSet.endsAt < now
    ) {
      return null;
    }

    const due = await dueEmailDeliveries(
      ctx,
      args.missionSetId,
      now,
      EMAIL_CLAIM_LIMIT,
    );
    const recipients = [];
    for (const delivery of due) {
      // A lease that keeps expiring means the send keeps dying mid-flight.
      if (delivery.attempts >= MAX_EMAIL_ATTEMPTS) {
        await ctx.db.patch(delivery._id, { status: "failed" });
        continue;
      }
      const recipient = await emailRecipient(
        ctx,
        await ctx.db.get(delivery.userId),
      );
      if (recipient === null) {
        await ctx.db.patch(delivery._id, { status: "skipped" });
        continue;
      }
      await ctx.db.patch(delivery._id, {
        status: "sending",
        attempts: delivery.attempts + 1,
        nextAttemptAt: now + EMAIL_SEND_LEASE_MS,
      });
      recipients.push({ deliveryId: delivery._id, ...recipient });
    }
    if (recipients.length === 0) return null;

    const missions = await ctx.db
      .query("missions")
      .withIndex("by_missionSetId", (q) =>
        q.eq("missionSetId", args.missionSetId),
      )
      .take(100);

    return {
      name: missionSet.name,
      startsAt: missionSet.startsAt,
      endsAt: missionSet.endsAt,
      missions: missions
        .filter((mission) => mission.status === "published")
        .map((mission) => ({
          title: mission.title,
          tracks: mission.tracks ?? [mission.track],
        })),
      recipients,
    };
  },
});

export const recordActiveSetEmailResults = internalMutation({
  args: {
    results: v.array(
      v.object({
        deliveryId: v.id("missionSetEmailDeliveries"),
        result: v.union(
          v.literal("sent"),
          v.literal("failed"),
          v.literal("unknown"),
        ),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const result of args.results) {
      const delivery = await ctx.db.get(result.deliveryId);
      if (delivery === null || delivery.status === "sent") continue;
      if (result.result === "sent") {
        await ctx.db.patch(delivery._id, { status: "sent", sentAt: now });
      } else if (
        // Resend may have sent it, and a retry would use a new idempotency
        // key, so give up rather than risk a duplicate email.
        result.result === "unknown" ||
        delivery.attempts >= MAX_EMAIL_ATTEMPTS
      ) {
        await ctx.db.patch(delivery._id, { status: "failed" });
      } else {
        await ctx.db.patch(delivery._id, {
          status: "pending",
          nextAttemptAt:
            now + EMAIL_RETRY_BASE_MS * 2 ** Math.max(delivery.attempts - 1, 0),
        });
      }
    }
    return null;
  },
});

export const sendActiveSetEmails = internalAction({
  args: { missionSetId: v.id("missionSets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const claim: Infer<typeof emailClaimValidator> | null =
      await ctx.runMutation(internal.missionSets.claimActiveSetEmails, args);
    if (claim === null) return null;

    const messages = claim.recipients.map((recipient) => ({
      recipient: recipient.email,
      email: missionSetActiveEmail({
        name: recipient.name,
        userId: recipient.userId,
        setName: claim.name,
        startsAt: claim.startsAt,
        endsAt: claim.endsAt,
        // Ambassadors only see missions for their own track in the portal.
        missionTitles: claim.missions
          .filter(
            (mission) =>
              recipient.track !== null &&
              mission.tracks.includes(recipient.track),
          )
          .slice(0, MAX_EMAILED_MISSIONS)
          .map((mission) => mission.title),
        logoUrl: EMAIL_LOGO_URL,
      }),
    }));

    const results = await trySendEmailBatch(messages);
    await ctx.runMutation(internal.missionSets.recordActiveSetEmailResults, {
      results: claim.recipients.map((recipient, index) => ({
        deliveryId: recipient.deliveryId,
        result: results[index] ?? "failed",
      })),
    });
    console.log(
      `Mission set "${claim.name}" email sent to ${results.filter((result) => result === "sent").length} of ${messages.length} ambassadors.`,
    );
    return null;
  },
});
