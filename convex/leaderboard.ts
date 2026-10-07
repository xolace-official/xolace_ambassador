import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireRole } from "./model/auth";

const periodValidator = v.union(v.literal("allTime"), v.literal("lastMission"));

const entryValidator = v.object({
  rank: v.number(),
  userId: v.id("users"),
  name: v.string(),
  image: v.union(v.string(), v.null()),
  points: v.number(),
  levelRank: v.number(),
  contributionsApproved: v.number(),
  missionsCompleted: v.number(),
  peopleReached: v.number(),
});

export const getLeaderboard = query({
  args: { period: v.optional(periodValidator) },
  returns: v.object({
    published: v.boolean(),
    publishedAt: v.union(v.number(), v.null()),
    missionSetName: v.union(v.string(), v.null()),
    entries: v.array(entryValidator),
    currentUserId: v.id("users"),
    currentUserRank: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await requireRole(ctx);
    const period = args.period ?? "allTime";
    if (period === "allTime") {
      const entries = rankEntries(await entriesForAllTime(ctx));
      const current = entries.find((entry) => entry.userId === user._id);
      return {
        published: true,
        publishedAt: null,
        missionSetName: null,
        entries,
        currentUserId: user._id,
        currentUserRank: current?.rank ?? 0,
      };
    }

    const publication = await ctx.db
      .query("leaderboardPublications")
      .withIndex("by_publishedAt")
      .order("desc")
      .first();

    if (publication === null) {
      return emptyLeaderboard(user._id);
    }

    const missionSet = await ctx.db.get(publication.missionSetId);
    if (missionSet === null) return emptyLeaderboard(user._id);

    const rawEntries = await entriesForSet(ctx, publication.missionSetId);
    const entries = rankEntries(rawEntries);
    const current = entries.find((entry) => entry.userId === user._id);

    return {
      published: true,
      publishedAt: publication.publishedAt,
      missionSetName: missionSet.name,
      entries,
      currentUserId: user._id,
      currentUserRank: current?.rank ?? 0,
    };
  },
});

export const adminPublicationStatus = query({
  args: {},
  returns: v.object({
    missionSetId: v.union(v.id("missionSets"), v.null()),
    missionSetName: v.union(v.string(), v.null()),
    endsAt: v.union(v.number(), v.null()),
    pendingCount: v.number(),
    published: v.boolean(),
    canPublish: v.boolean(),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const missionSet = await latestClosedSet(ctx);
    if (missionSet === null) {
      return {
        missionSetId: null,
        missionSetName: null,
        endsAt: null,
        pendingCount: 0,
        published: false,
        canPublish: false,
      };
    }

    const pendingCount = await pendingCountForSet(ctx, missionSet._id);
    const publication = await ctx.db
      .query("leaderboardPublications")
      .withIndex("by_missionSetId", (q) => q.eq("missionSetId", missionSet._id))
      .first();

    return {
      missionSetId: missionSet._id,
      missionSetName: missionSet.name,
      endsAt: missionSet.endsAt,
      pendingCount,
      published: publication !== null,
      canPublish: pendingCount === 0 && publication === null,
    };
  },
});

export const adminSetPublicationStatus = query({
  args: { missionSetId: v.id("missionSets") },
  returns: v.object({
    published: v.boolean(),
    pendingCount: v.number(),
    canPublish: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const missionSet = await ctx.db.get(args.missionSetId);
    if (missionSet === null) {
      return { published: false, pendingCount: 0, canPublish: false };
    }
    const publication = await ctx.db
      .query("leaderboardPublications")
      .withIndex("by_missionSetId", (q) =>
        q.eq("missionSetId", args.missionSetId),
      )
      .first();
    const pendingCount = await pendingCountForSet(ctx, args.missionSetId);
    return {
      published: publication !== null,
      pendingCount,
      canPublish:
        publication === null &&
        pendingCount === 0 &&
        (missionSet.endsAt <= Date.now() || missionSet.status === "closed"),
    };
  },
});

export const adminTogglePublication = mutation({
  args: { missionSetId: v.id("missionSets") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const missionSet = await ctx.db.get(args.missionSetId);
    if (missionSet === null) throw new Error("Mission set not found.");
    const existing = await ctx.db
      .query("leaderboardPublications")
      .withIndex("by_missionSetId", (q) =>
        q.eq("missionSetId", args.missionSetId),
      )
      .first();

    if (existing !== null) {
      await ctx.db.delete(existing._id);
      return false;
    }

    if (missionSet.endsAt > Date.now() && missionSet.status !== "closed") {
      throw new Error(
        "Close the mission set before publishing its leaderboard.",
      );
    }
    const pendingCount = await pendingCountForSet(ctx, args.missionSetId);
    if (pendingCount > 0) {
      throw new Error(
        `Review all ${pendingCount} pending submission${pendingCount === 1 ? "" : "s"} before publishing the leaderboard.`,
      );
    }

    await ctx.db.insert("leaderboardPublications", {
      missionSetId: args.missionSetId,
      publishedAt: Date.now(),
      publishedBy: admin._id,
    });
    await ctx.runMutation(internal.notifications.createForAmbassadors, {
      kind: "reward",
      title: "The ambassador leaderboard is live",
      description: `${missionSet.name} results are now available to view.`,
      href: "/leaderboard",
    });
    return true;
  },
});

export const adminPublish = mutation({
  args: { missionSetId: v.id("missionSets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const missionSet = await ctx.db.get(args.missionSetId);
    if (missionSet === null) throw new Error("Mission set not found.");
    if (missionSet.endsAt > Date.now() && missionSet.status !== "closed") {
      throw new Error(
        "Close the mission set before publishing its leaderboard.",
      );
    }

    const pendingCount = await pendingCountForSet(ctx, args.missionSetId);
    if (pendingCount > 0) {
      throw new Error(
        `Review all ${pendingCount} pending submission${pendingCount === 1 ? "" : "s"} before publishing the leaderboard.`,
      );
    }

    const existing = await ctx.db
      .query("leaderboardPublications")
      .withIndex("by_missionSetId", (q) =>
        q.eq("missionSetId", args.missionSetId),
      )
      .first();
    if (existing === null) {
      await ctx.db.insert("leaderboardPublications", {
        missionSetId: args.missionSetId,
        publishedAt: Date.now(),
        publishedBy: admin._id,
      });
    }

    await ctx.runMutation(internal.notifications.createForAmbassadors, {
      kind: "reward",
      title: "The ambassador leaderboard is live",
      description: `${missionSet.name} results are now available to view.`,
      href: "/leaderboard",
    });
    return null;
  },
});

async function latestClosedSet(ctx: Parameters<typeof requireAdmin>[0]) {
  const sets = await ctx.db
    .query("missionSets")
    .withIndex("by_startsAt")
    .order("desc")
    .take(100);
  return (
    sets
      .filter((missionSet) => missionSet.endsAt <= Date.now())
      .sort((a, b) => b.endsAt - a.endsAt)[0] ?? null
  );
}

async function pendingCountForSet(
  ctx: Parameters<typeof requireAdmin>[0],
  missionSetId: Id<"missionSets">,
) {
  const missions = await ctx.db
    .query("missions")
    .withIndex("by_missionSetId", (q) => q.eq("missionSetId", missionSetId))
    .take(500);
  const missionIds = new Set(missions.map((mission) => mission._id));
  const pending = await ctx.db
    .query("contributions")
    .withIndex("by_status", (q) => q.eq("status", "pending"))
    .take(1000);
  return pending.filter(
    (contribution) =>
      contribution.missionId !== undefined &&
      missionIds.has(contribution.missionId),
  ).length;
}

async function entriesForSet(
  ctx: Parameters<typeof requireRole>[0],
  missionSetId: Id<"missionSets">,
) {
  const missions = await ctx.db
    .query("missions")
    .withIndex("by_missionSetId", (q) => q.eq("missionSetId", missionSetId))
    .take(500);
  const missionIds = new Set(missions.map((mission) => mission._id));
  const missionById = new Map(
    missions.map((mission) => [mission._id, mission]),
  );
  const contributions = await ctx.db
    .query("contributions")
    .withIndex("by_status", (q) => q.eq("status", "approved"))
    .take(1000);
  return buildEntries(
    contributions.filter(
      (contribution) =>
        contribution.missionId !== undefined &&
        missionIds.has(contribution.missionId),
    ),
    missionById,
    ctx,
  );
}

async function entriesForAllTime(ctx: Parameters<typeof requireRole>[0]) {
  const totals = await ctx.db
    .query("ambassadorTotals")
    .withIndex("by_points")
    .order("desc")
    .take(500);
  return await Promise.all(
    totals.map(async (total) => {
      const ambassador = await ctx.db.get(total.userId);
      const image = ambassador?.avatarStorageId
        ? await ctx.storage.getUrl(ambassador.avatarStorageId)
        : (ambassador?.image ?? null);
      return {
        userId: total.userId,
        name: ambassador?.name?.trim() || "Ambassador",
        image,
        points: total.points,
        levelRank: total.levelRank,
        contributionsApproved: total.contributionsApproved,
        missionsCompleted: total.missionsCompleted,
        peopleReached: total.peopleReached,
        joinedAt: ambassador?._creationTime ?? 0,
      };
    }),
  );
}

async function buildEntries(
  contributions: Doc<"contributions">[],
  missionById: Map<Id<"missions">, Doc<"missions">>,
  ctx: Parameters<typeof requireRole>[0],
) {
  const byUser = new Map<
    Id<"users">,
    {
      points: number;
      contributionsApproved: number;
      missionsCompleted: number;
      peopleReached: number;
      joinedAt: number;
    }
  >();
  for (const contribution of contributions) {
    const current = byUser.get(contribution.ambassadorId) ?? {
      points: 0,
      contributionsApproved: 0,
      missionsCompleted: 0,
      peopleReached: 0,
      joinedAt: 0,
    };
    const mission =
      contribution.missionId === undefined
        ? null
        : missionById.get(contribution.missionId);
    current.points += contribution.awardedPoints ?? mission?.points ?? 0;
    current.contributionsApproved += 1;
    if (contribution.kind === "mission_submission")
      current.missionsCompleted += 1;
    if (
      contribution.kind === "people_reached" ||
      contribution.kind === "mission_submission"
    ) {
      current.peopleReached += contribution.quantity ?? 0;
    }
    byUser.set(contribution.ambassadorId, current);
  }
  return await Promise.all(
    [...byUser.entries()].map(async ([userId, value]) => {
      const ambassador = await ctx.db.get(userId);
      const image = ambassador?.avatarStorageId
        ? await ctx.storage.getUrl(ambassador.avatarStorageId)
        : (ambassador?.image ?? null);
      const totals = await ctx.db
        .query("ambassadorTotals")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      return {
        userId,
        name: ambassador?.name?.trim() || "Ambassador",
        image,
        ...value,
        levelRank: totals?.levelRank ?? 0,
        joinedAt: ambassador?._creationTime ?? 0,
      };
    }),
  );
}

function rankEntries(
  entries: Array<{
    userId: Id<"users">;
    name: string;
    image: string | null;
    points: number;
    levelRank: number;
    contributionsApproved: number;
    missionsCompleted: number;
    peopleReached: number;
    joinedAt: number;
  }>,
) {
  const sorted = entries
    .slice()
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.levelRank - a.levelRank ||
        b.peopleReached - a.peopleReached ||
        b.missionsCompleted - a.missionsCompleted ||
        b.contributionsApproved - a.contributionsApproved ||
        a.joinedAt - b.joinedAt ||
        a.name.localeCompare(b.name),
    );
  return sorted.map((entry, index) => {
    const { joinedAt: _joinedAt, ...publicEntry } = entry;
    return { rank: index + 1, ...publicEntry };
  });
}

function emptyLeaderboard(userId: Id<"users">) {
  return {
    published: false,
    publishedAt: null,
    missionSetName: null,
    entries: [],
    currentUserId: userId,
    currentUserRank: 0,
  };
}
