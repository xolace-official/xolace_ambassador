import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireRole } from "./model/auth";

export const getRewards = query({
  args: {},
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
  handler: async (ctx) => {
    const user = await requireRole(ctx);

    const [totals, levels, ledgerEntries, recognitions] = await Promise.all([
      ctx.db
        .query("ambassadorTotals")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first(),
      ctx.db.query("levels").order("asc").collect(),
      ctx.db
        .query("pointLedger")
        .withIndex("by_ambassadorId", (q) => q.eq("ambassadorId", user._id))
        .order("desc")
        .take(20),
      ctx.db
        .query("recognitions")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect(),
    ]);

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

    let currentLevel = sortedLevels[0];
    let nextLevel = null;
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
        levelRank: totals?.levelRank ?? 0,
        contributionsApproved: totals?.contributionsApproved ?? 0,
        missionsCompleted: totals?.missionsCompleted ?? 0,
      },
      levels: sortedLevels,
      currentLevel,
      nextLevel,
      progress,
      ledger: ledgerEntries,
      recognitions,
    };
  },
});
