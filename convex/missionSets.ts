import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
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

async function announceIfActive(
  ctx: MutationCtx,
  missionSetId: Id<"missionSets">,
) {
  const missionSet = await ctx.db.get(missionSetId);
  const now = Date.now();
  if (
    missionSet === null ||
    missionSet.status !== "published" ||
    missionSet.announcedAt !== undefined ||
    missionSet.startsAt > now ||
    missionSet.endsAt < now
  ) {
    return;
  }

  await ctx.db.patch(missionSetId, { announcedAt: now });
  await ctx.runMutation(internal.notifications.createForAmbassadors, {
    kind: "mission",
    title: "A new mission set is available",
    description: `${missionSet.name} is now open for contributions.`,
    href: "/missions",
  });
  // Sending needs `fetch`, which a mutation cannot do, so the email goes out
  // from an action after this write commits.
  await ctx.scheduler.runAfter(0, internal.missionSets.sendActiveSetEmails, {
    missionSetId,
  });
}

export const activeSetEmailDetails = internalQuery({
  args: { missionSetId: v.id("missionSets") },
  returns: v.union(
    v.object({
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
          name: v.string(),
          email: v.string(),
          track: v.union(trackValidator, v.null()),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const missionSet = await ctx.db.get(args.missionSetId);
    if (missionSet === null || missionSet.status !== "published") return null;

    const missions = await ctx.db
      .query("missions")
      .withIndex("by_missionSetId", (q) =>
        q.eq("missionSetId", args.missionSetId),
      )
      .take(100);

    const ambassadors = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "ambassador"))
      .take(500);

    const recipients = [];
    for (const ambassador of ambassadors) {
      if (!ambassador.email) continue;
      if (ambassador.notificationPreferences?.mission === false) continue;
      const profile = await ctx.db
        .query("ambassadorProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", ambassador._id))
        .first();
      // Only active ambassadors; an account with no profile is not active yet.
      if (profile?.status !== "active") continue;
      recipients.push({
        name: ambassador.name?.trim() || "there",
        email: ambassador.email,
        track: profile.track ?? null,
      });
    }

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

export const sendActiveSetEmails = internalAction({
  args: { missionSetId: v.id("missionSets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const details = await ctx.runQuery(
      internal.missionSets.activeSetEmailDetails,
      args,
    );
    if (details === null || details.recipients.length === 0) return null;

    const messages = details.recipients.map((recipient) => ({
      recipient: recipient.email,
      email: missionSetActiveEmail({
        name: recipient.name,
        setName: details.name,
        startsAt: details.startsAt,
        endsAt: details.endsAt,
        // Ambassadors only see missions for their own track in the portal.
        missionTitles: details.missions
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

    const sent = await trySendEmailBatch(messages);
    console.log(
      `Mission set "${details.name}" email sent to ${sent} of ${messages.length} ambassadors.`,
    );
    return null;
  },
});
