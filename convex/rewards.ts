import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireRole } from "./model/auth";

export const getRewards = query({
  args: {
    history: v.optional(v.union(v.literal("summary"), v.literal("all"))),
  },
  returns: v.object({
    totals: v.object({
      points: v.number(),
      levelRank: v.number(),
      contributionsApproved: v.number(),
      missionsCompleted: v.number(),
    }),
    levels: v.array(
      v.object({
        rank: v.number(),
        key: v.string(),
        name: v.string(),
        minPoints: v.number(),
        description: v.string(),
      }),
    ),
    currentLevel: v.object({
      rank: v.number(),
      key: v.string(),
      name: v.string(),
      minPoints: v.number(),
      description: v.string(),
    }),
    nextLevel: v.union(
      v.object({
        rank: v.number(),
        key: v.string(),
        name: v.string(),
        minPoints: v.number(),
        description: v.string(),
      }),
      v.null(),
    ),
    progress: v.number(),
    availablePoints: v.number(),
    ledger: v.array(
      v.object({
        _id: v.id("pointLedger"),
        _creationTime: v.number(),
        delta: v.number(),
        reason: v.string(),
        actionKey: v.optional(v.string()),
      }),
    ),
    recognitions: v.array(
      v.object({
        _id: v.id("recognitions"),
        _creationTime: v.number(),
        kind: v.string(),
        note: v.string(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const user = await requireRole(ctx);

    const [totals, levels, ledgerEntries, missions, recognitions] =
      await Promise.all([
        ctx.db
          .query("ambassadorTotals")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .first(),
        ctx.db.query("levels").withIndex("by_rank").order("asc").take(100),
        ctx.db
          .query("pointLedger")
          .withIndex("by_ambassadorId", (q) => q.eq("ambassadorId", user._id))
          .order("desc")
          .take(args.history === "all" ? 100 : 3),
        ctx.db.query("missions").withIndex("by_status").take(500),
        ctx.db
          .query("recognitions")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .order("desc")
          .take(50),
      ]);

    const availablePoints = missions
      .filter((mission) => mission.status !== "draft")
      .reduce((sum, mission) => sum + mission.points, 0);

    const points = totals?.points ?? 0;
    const sortedLevels = levels
      .map((l) => ({
        rank: l.rank,
        key: l.key,
        name: l.name,
        minPoints: l.minPoints,
        description: l.description,
      }))
      .sort((a, b) => a.rank - b.rank);

    const fallbackLevel = {
      rank: 1,
      key: "xolacer",
      name: "Xolacer",
      minPoints: 0,
      description: "Complete your first contribution to begin progressing.",
    };
    const fallbackNextLevel = {
      rank: 2,
      key: "ambassador",
      name: "Ambassador",
      minPoints: 100,
      description: "Consistently contributing.",
    };
    let currentLevel = sortedLevels[0] ?? fallbackLevel;
    let nextLevel = sortedLevels.length === 0 ? fallbackNextLevel : null;
    for (let i = 0; i < sortedLevels.length; i++) {
      if (points >= sortedLevels[i].minPoints) {
        currentLevel = sortedLevels[i];
        nextLevel = sortedLevels[i + 1] ?? null;
      }
    }

    const progress = nextLevel
      ? Math.min(
          (points - currentLevel.minPoints) /
            (nextLevel.minPoints - currentLevel.minPoints),
          1,
        )
      : 1;

    return {
      totals: {
        points,
        levelRank: Math.max(totals?.levelRank ?? 1, 1),
        contributionsApproved: totals?.contributionsApproved ?? 0,
        missionsCompleted: totals?.missionsCompleted ?? 0,
      },
      levels: sortedLevels,
      currentLevel,
      nextLevel,
      progress,
      availablePoints,
      ledger: ledgerEntries.map((entry) => ({
        _id: entry._id,
        _creationTime: entry._creationTime,
        delta: entry.delta,
        reason: entry.reason,
        ...(entry.actionKey ? { actionKey: entry.actionKey } : {}),
      })),
      recognitions,
    };
  },
});

const rewardValidator = v.object({
  _id: v.id("rewards"),
  _creationTime: v.number(),
  name: v.string(),
  description: v.string(),
  costPoints: v.number(),
  stock: v.union(v.number(), v.null()),
  status: v.union(v.literal("active"), v.literal("paused")),
});

export const listCatalogue = query({
  args: {},
  returns: v.array(rewardValidator),
  handler: async (ctx) => {
    await requireRole(ctx);
    const rewards = await ctx.db
      .query("rewards")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .take(100);
    return rewards.map((reward) => ({
      _id: reward._id,
      _creationTime: reward._creationTime,
      name: reward.name,
      description: reward.description,
      costPoints: reward.costPoints,
      stock: reward.stock ?? null,
      status: reward.status,
    }));
  },
});

export const listRedemptions = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("rewardRedemptions"),
      _creationTime: v.number(),
      rewardName: v.string(),
      points: v.number(),
      status: v.union(
        v.literal("requested"),
        v.literal("approved"),
        v.literal("declined"),
        v.literal("fulfilled"),
      ),
      reviewNote: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx) => {
    const user = await requireRole(ctx);
    const redemptions = await ctx.db
      .query("rewardRedemptions")
      .withIndex("by_ambassadorId", (q) => q.eq("ambassadorId", user._id))
      .order("desc")
      .take(100);
    return Promise.all(
      redemptions.map(async (redemption) => {
        const reward = await ctx.db.get(redemption.rewardId);
        return {
          _id: redemption._id,
          _creationTime: redemption._creationTime,
          rewardName: reward?.name ?? "Reward unavailable",
          points: redemption.points,
          status: redemption.status,
          reviewNote: redemption.reviewNote ?? null,
        };
      }),
    );
  },
});

export const redeem = mutation({
  args: { rewardId: v.id("rewards") },
  returns: v.id("rewardRedemptions"),
  handler: async (ctx, args) => {
    const user = await requireRole(ctx);
    if (user.role !== "ambassador") throw new Error("Ambassadors only.");
    const reward = await ctx.db.get(args.rewardId);
    if (reward === null || reward.status !== "active") {
      throw new Error("This reward is no longer available.");
    }
    if (reward.stock !== undefined && reward.stock <= 0) {
      throw new Error("This reward is currently out of stock.");
    }
    const totals = await ctx.db
      .query("ambassadorTotals")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if ((totals?.points ?? 0) < reward.costPoints) {
      throw new Error("You do not have enough points for this reward.");
    }
    const redemptionId = await ctx.db.insert("rewardRedemptions", {
      rewardId: reward._id,
      ambassadorId: user._id,
      points: reward.costPoints,
      status: "requested",
    });
    await ctx.runMutation(internal.notifications.createForUser, {
      recipientId: user._id,
      kind: "reward",
      title: "Reward redemption requested",
      description: `${reward.name} is waiting for the program team to review.`,
      href: `/ambassador/${user._id}/rewards`,
    });
    return redemptionId;
  },
});

export const adminListRewards = query({
  args: {},
  returns: v.array(rewardValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const [active, paused] = await Promise.all([
      ctx.db
        .query("rewards")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .order("desc")
        .take(100),
      ctx.db
        .query("rewards")
        .withIndex("by_status", (q) => q.eq("status", "paused"))
        .order("desc")
        .take(100),
    ]);
    const rewards = [...active, ...paused].sort(
      (a, b) => b._creationTime - a._creationTime,
    );
    return rewards.map((reward) => ({
      _id: reward._id,
      _creationTime: reward._creationTime,
      name: reward.name,
      description: reward.description,
      costPoints: reward.costPoints,
      stock: reward.stock ?? null,
      status: reward.status,
    }));
  },
});

export const adminCreateReward = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    costPoints: v.number(),
    stock: v.optional(v.number()),
  },
  returns: v.id("rewards"),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const name = args.name.trim();
    const description = args.description.trim();
    if (!name || name.length > 120)
      throw new Error("Enter a reward name under 120 characters.");
    if (!description || description.length > 500)
      throw new Error("Enter a description under 500 characters.");
    if (!Number.isInteger(args.costPoints) || args.costPoints <= 0)
      throw new Error("Set a whole-number point cost above zero.");
    if (
      args.stock !== undefined &&
      (!Number.isInteger(args.stock) || args.stock < 0)
    )
      throw new Error("Stock must be zero or a positive whole number.");
    return await ctx.db.insert("rewards", {
      name,
      description,
      costPoints: args.costPoints,
      stock: args.stock,
      status: "active",
      createdBy: admin._id,
    });
  },
});

export const adminUpdateRewardStatus = mutation({
  args: {
    rewardId: v.id("rewards"),
    status: v.union(v.literal("active"), v.literal("paused")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const reward = await ctx.db.get(args.rewardId);
    if (reward === null) throw new Error("Reward not found.");
    await ctx.db.patch(reward._id, { status: args.status });
    return null;
  },
});

export const adminListRedemptions = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("rewardRedemptions"),
      _creationTime: v.number(),
      ambassadorName: v.string(),
      rewardName: v.string(),
      points: v.number(),
      status: v.union(
        v.literal("requested"),
        v.literal("approved"),
        v.literal("declined"),
        v.literal("fulfilled"),
      ),
      reviewNote: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const statuses = [
      "requested",
      "approved",
      "declined",
      "fulfilled",
    ] as const;
    const redemptionGroups = await Promise.all(
      statuses.map((status) =>
        ctx.db
          .query("rewardRedemptions")
          .withIndex("by_status", (q) => q.eq("status", status))
          .order("desc")
          .take(100),
      ),
    );
    const redemptions = redemptionGroups
      .flat()
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 200);
    return Promise.all(
      redemptions.map(async (redemption) => {
        const [ambassador, reward] = await Promise.all([
          ctx.db.get(redemption.ambassadorId),
          ctx.db.get(redemption.rewardId),
        ]);
        return {
          _id: redemption._id,
          _creationTime: redemption._creationTime,
          ambassadorName: ambassador?.name?.trim() || "Ambassador",
          rewardName: reward?.name ?? "Reward unavailable",
          points: redemption.points,
          status: redemption.status,
          reviewNote: redemption.reviewNote ?? null,
        };
      }),
    );
  },
});

export const adminReviewRedemption = mutation({
  args: {
    redemptionId: v.id("rewardRedemptions"),
    status: v.union(
      v.literal("approved"),
      v.literal("declined"),
      v.literal("fulfilled"),
    ),
    reviewNote: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const redemption = await ctx.db.get(args.redemptionId);
    if (redemption === null) throw new Error("Redemption not found.");
    if (args.status === "fulfilled" && redemption.status !== "approved")
      throw new Error("Approve the redemption before marking it fulfilled.");
    if (args.status !== "fulfilled" && redemption.status !== "requested")
      throw new Error("This redemption has already been reviewed.");
    const note = args.reviewNote?.trim();
    if (args.status === "declined" && (!note || note.length < 5))
      throw new Error("Add a short reason before declining.");
    if (args.status === "approved") {
      const reward = await ctx.db.get(redemption.rewardId);
      if (reward === null || reward.status !== "active")
        throw new Error("This reward is no longer available.");
      if (reward.stock !== undefined && reward.stock <= 0)
        throw new Error("This reward is out of stock.");
      const totals = await ctx.db
        .query("ambassadorTotals")
        .withIndex("by_userId", (q) => q.eq("userId", redemption.ambassadorId))
        .first();
      if ((totals?.points ?? 0) < redemption.points)
        throw new Error("The ambassador no longer has enough points.");
      if (totals === null)
        throw new Error("Ambassador reward totals are not ready.");
      await ctx.db.patch(totals._id, {
        points: totals.points - redemption.points,
      });
      await ctx.db.insert("pointLedger", {
        ambassadorId: redemption.ambassadorId,
        delta: -redemption.points,
        reason: reward.name,
        awardedBy: admin._id,
      });
      if (reward.stock !== undefined)
        await ctx.db.patch(reward._id, { stock: reward.stock - 1 });
    }
    await ctx.db.patch(redemption._id, {
      status: args.status,
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
      reviewNote: note,
    });
    await ctx.runMutation(internal.notifications.createForUser, {
      recipientId: redemption.ambassadorId,
      kind: "reward",
      title:
        args.status === "approved"
          ? "Reward redemption approved"
          : args.status === "fulfilled"
            ? "Reward fulfilled"
            : "Reward redemption declined",
      description: note ?? "Your reward redemption status has been updated.",
      href: `/ambassador/${redemption.ambassadorId}/rewards`,
    });
    return null;
  },
});
