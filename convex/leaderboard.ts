import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireRole } from "./model/auth";
import type { Id } from "./_generated/dataModel";

const periodValidator = v.union(
  v.literal("allTime"),
  v.literal("lastMission"),
);

export const getLeaderboard = query({
  args: { period: v.optional(periodValidator) },
  returns: v.object({
    entries: v.array(
      v.object({
        userId: v.id("users"),
        name: v.string(),
        points: v.number(),
        levelRank: v.number(),
        contributionsApproved: v.number(),
        missionsCompleted: v.number(),
        peopleReached: v.number(),
      }),
    ),
    currentUserId: v.id("users"),
    currentUserRank: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await requireRole(ctx);
    const period = args.period ?? "allTime";

    if (period === "lastMission") {
      const latestMission = await ctx.db
        .query("missions")
        .order("desc")
        .first();

      if (latestMission === null) {
        return {
          entries: [],
          currentUserId: user._id,
          currentUserRank: 0,
        };
      }

      const contributions = await ctx.db
        .query("contributions")
        .withIndex("by_missionId", (q) => q.eq("missionId", latestMission._id))
        .collect();

      const approved = contributions.filter((c) => c.status === "approved");

      const pointsByUser = new Map<Id<"users">, number>();
      for (const c of approved) {
        const pts = c.awardedPoints ?? 0;
        pointsByUser.set(
          c.ambassadorId,
          (pointsByUser.get(c.ambassadorId) ?? 0) + pts,
        );
      }

      const sorted = [...pointsByUser.entries()]
        .map(([ambassadorId, points]) => ({ ambassadorId, points }))
        .sort((a, b) => b.points - a.points);

      const entries = await Promise.all(
        sorted.map(async (entry) => {
          const ambassador = await ctx.db.get(entry.ambassadorId);
          const totals = await ctx.db
            .query("ambassadorTotals")
            .withIndex("by_userId", (q) => q.eq("userId", entry.ambassadorId))
            .first();
          return {
            userId: entry.ambassadorId,
            name: ambassador?.name?.trim() || "Ambassador",
            points: entry.points,
            levelRank: totals?.levelRank ?? 0,
            contributionsApproved: totals?.contributionsApproved ?? 0,
            missionsCompleted: totals?.missionsCompleted ?? 0,
            peopleReached: totals?.peopleReached ?? 0,
          };
        }),
      );

      const currentUserRank =
        entries.findIndex((e) => e.userId === user._id) + 1;

      return {
        entries,
        currentUserId: user._id,
        currentUserRank,
      };
    }

    const totals = await ctx.db
      .query("ambassadorTotals")
      .withIndex("by_points")
      .order("desc")
      .collect();

    const entries = await Promise.all(
      totals.map(async (t) => {
        const ambassador = await ctx.db.get(t.userId);
        return {
          userId: t.userId,
          name: ambassador?.name?.trim() || "Ambassador",
          points: t.points,
          levelRank: t.levelRank,
          contributionsApproved: t.contributionsApproved,
          missionsCompleted: t.missionsCompleted,
          peopleReached: t.peopleReached,
        };
      }),
    );

    const currentUserRank =
      entries.findIndex((e) => e.userId === user._id) + 1;

    return {
      entries,
      currentUserId: user._id,
      currentUserRank,
    };
  },
});
