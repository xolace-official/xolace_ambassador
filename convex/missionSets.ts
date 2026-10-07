import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalMutation,
  type MutationCtx,
  mutation,
  query,
} from "./_generated/server";
import { requireAdmin } from "./model/auth";

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
    await assertNoActiveSet(ctx, args.status, null);

    const missionSetId = await ctx.db.insert("missionSets", {
      name,
      description: description || undefined,
      status: args.status,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      createdBy: admin._id,
    });
    if (
      args.status === "published" &&
      args.startsAt <= Date.now() &&
      args.endsAt >= Date.now()
    ) {
      await ctx.runMutation(internal.notifications.createForAmbassadors, {
        kind: "mission",
        title: "A new mission set is available",
        description: `${name} is now open for contributions.`,
        href: "/missions",
      });
    }
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
    await assertNoActiveSet(ctx, args.status, args.missionSetId);

    await ctx.db.patch(args.missionSetId, {
      name,
      description: args.description?.trim() || undefined,
      status: args.status,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
    });
    if (
      args.status === "published" &&
      args.startsAt <= Date.now() &&
      args.endsAt >= Date.now() &&
      (missionSet.status !== "published" ||
        missionSet.startsAt !== args.startsAt ||
        missionSet.endsAt !== args.endsAt)
    ) {
      await ctx.runMutation(internal.notifications.createForAmbassadors, {
        kind: "mission",
        title: "A new mission set is available",
        description: `${name} is now open for contributions.`,
        href: "/missions",
      });
    }
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
) {
  if (status !== "published") return;

  const now = Date.now();
  const publishedSets = await ctx.db
    .query("missionSets")
    .withIndex("by_status", (q) => q.eq("status", "published"))
    .take(100);
  const activeSet = publishedSets.find(
    (missionSet) =>
      missionSet._id !== currentId &&
      missionSet.startsAt <= now &&
      missionSet.endsAt >= now,
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
    const activeSet = await ctx.db
      .query("missionSets")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(100);

    if (
      activeSet.some(
        (missionSet) => missionSet.startsAt <= now && missionSet.endsAt >= now,
      )
    ) {
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
      await ctx.runMutation(internal.notifications.createForAmbassadors, {
        kind: "mission",
        title: "A new mission set is available",
        description: `${nextSet.name} is now open for contributions.`,
        href: "/missions",
      });
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
