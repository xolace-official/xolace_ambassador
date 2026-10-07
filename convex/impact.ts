import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { type QueryCtx, query } from "./_generated/server";
import { requireAdmin, requireRole } from "./model/auth";

const contributionValidator = v.object({
  _id: v.id("contributions"),
  _creationTime: v.number(),
  title: v.string(),
  kind: v.string(),
  status: v.string(),
  quantity: v.optional(v.number()),
  awardedPoints: v.optional(v.number()),
});

export const getForAmbassador = query({
  args: {},
  returns: v.object({
    totals: v.object({
      points: v.number(),
      missionsCompleted: v.number(),
      peopleReached: v.number(),
      referrals: v.number(),
    }),
    timeline: v.array(v.object({ date: v.number(), points: v.number() })),
    breakdown: v.array(v.object({ kind: v.string(), count: v.number() })),
    contributions: v.array(contributionValidator),
  }),
  handler: async (ctx) => {
    const user = await requireRole(ctx);
    const [totals, ledger, contributions, activeSetId, missionSets] =
      await Promise.all([
        ctx.db
          .query("ambassadorTotals")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .first(),
        ctx.db
          .query("pointLedger")
          .withIndex("by_ambassadorId", (q) => q.eq("ambassadorId", user._id))
          .order("desc")
          .take(500),
        ctx.db
          .query("contributions")
          .withIndex("by_ambassadorId", (q) => q.eq("ambassadorId", user._id))
          .order("desc")
          .take(200),
        visibleMissionSetId(ctx, Date.now()),
        ctx.db
          .query("missionSets")
          .withIndex("by_startsAt")
          .order("asc")
          .take(100),
      ]);

    const currentMissionIds = new Set<Id<"missions">>();
    if (activeSetId !== null) {
      const missions = await ctx.db
        .query("missions")
        .withIndex("by_missionSetId", (q) => q.eq("missionSetId", activeSetId))
        .take(200);
      for (const mission of missions) currentMissionIds.add(mission._id);
    }

    const currentContributions = contributions
      .filter(
        (contribution) =>
          contribution.missionId !== undefined &&
          currentMissionIds.has(contribution.missionId),
      )
      .map((contribution) => ({
        _id: contribution._id,
        _creationTime: contribution._creationTime,
        title: contribution.title,
        kind: contribution.kind,
        status: contribution.status,
        quantity: contribution.quantity,
        awardedPoints: contribution.awardedPoints,
      }));

    const quantityKinds = new Set([
      "people_reached",
      "app_install",
      "referral",
    ]);
    const breakdownMap = new Map<string, number>();
    for (const contribution of currentContributions) {
      if (contribution.status !== "approved") continue;
      const value = quantityKinds.has(contribution.kind)
        ? (contribution.quantity ?? 0)
        : 1;
      breakdownMap.set(
        contribution.kind,
        (breakdownMap.get(contribution.kind) ?? 0) + value,
      );
    }

    const approvedContributions = contributions.filter(
      (contribution) =>
        contribution.status === "approved" &&
        contribution.kind === "mission_submission",
    );
    const approvedContributionIds = new Set(
      approvedContributions.map((contribution) => contribution._id),
    );
    const approvedMissionIds = new Set(
      approvedContributions
        .map((contribution) => contribution.missionId)
        .filter((id): id is Id<"missions"> => id !== undefined),
    );
    const contributionEvents = await Promise.all(
      approvedContributions.map(async (contribution) => {
        const mission =
          contribution.missionId === undefined
            ? null
            : await ctx.db.get(contribution.missionId);
        return {
          date: contribution._creationTime,
          delta: contribution.awardedPoints ?? mission?.points ?? 0,
        };
      }),
    );
    const ledgerEvents = ledger
      .filter(
        (entry) =>
          (entry.contributionId === undefined ||
            !approvedContributionIds.has(entry.contributionId)) &&
          (entry.missionId === undefined ||
            !approvedMissionIds.has(entry.missionId)),
      )
      .map((entry) => ({
        date: entry._creationTime,
        delta: entry.delta,
      }));
    const allPointEvents = [...ledgerEvents, ...contributionEvents].sort(
      (a, b) => a.date - b.date,
    );
    const eventPoints = allPointEvents.reduce(
      (sum, entry) => sum + entry.delta,
      0,
    );
    const totalPoints = Math.max(totals?.points ?? 0, eventPoints);
    const byDay = new Map<number, number>();
    for (const entry of allPointEvents) {
      const day = new Date(entry.date);
      day.setUTCHours(0, 0, 0, 0);
      const dayTimestamp = day.getTime();
      byDay.set(dayTimestamp, (byDay.get(dayTimestamp) ?? 0) + entry.delta);
    }
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    for (const missionSet of missionSets) {
      const isClosed = missionSet.endsAt <= Date.now();
      const isCurrent = missionSet._id === activeSetId;
      if (isClosed || isCurrent) {
        const checkpoint = isCurrent ? now.getTime() : missionSet.endsAt;
        const day = new Date(checkpoint);
        day.setUTCHours(0, 0, 0, 0);
        const dayTimestamp = day.getTime();
        byDay.set(dayTimestamp, byDay.get(dayTimestamp) ?? 0);
      }
    }
    let runningPoints = totalPoints - eventPoints;
    const timeline = [...byDay.entries()]
      .sort(([a], [b]) => a - b)
      .map(([date, delta]) => {
        runningPoints += delta;
        return { date, points: runningPoints };
      });

    return {
      totals: {
        points: totalPoints,
        missionsCompleted: totals?.missionsCompleted ?? 0,
        peopleReached: totals?.peopleReached ?? 0,
        referrals: totals?.referrals ?? 0,
      },
      timeline,
      breakdown: [...breakdownMap.entries()]
        .map(([kind, count]) => ({ kind, count }))
        .sort((a, b) => b.count - a.count),
      contributions: currentContributions,
    };
  },
});

export const getContributionHistory = query({
  args: {
    history: v.optional(v.union(v.literal("summary"), v.literal("all"))),
  },
  returns: v.array(contributionValidator),
  handler: async (ctx, args) => {
    const user = await requireRole(ctx);
    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_ambassadorId", (q) => q.eq("ambassadorId", user._id))
      .order("desc")
      .take(args.history === "all" ? 500 : 3);

    return contributions.map((contribution) => ({
      _id: contribution._id,
      _creationTime: contribution._creationTime,
      title: contribution.title,
      kind: contribution.kind,
      status: contribution.status,
      quantity: contribution.quantity,
      awardedPoints: contribution.awardedPoints,
    }));
  },
});

async function visibleMissionSetId(
  ctx: QueryCtx,
  now: number,
): Promise<Id<"missionSets"> | null> {
  const published = await ctx.db
    .query("missionSets")
    .withIndex("by_status", (q) => q.eq("status", "published"))
    .take(100);
  const active = published.find(
    (missionSet) => missionSet.startsAt <= now && missionSet.endsAt >= now,
  );
  if (active !== undefined) return active._id;

  const next = await ctx.db
    .query("missionSets")
    .withIndex("by_status", (q) => q.eq("status", "published_next"))
    .take(100);
  return (
    next
      .filter(
        (missionSet) => missionSet.startsAt <= now && missionSet.endsAt >= now,
      )
      .sort((a, b) => a.startsAt - b.startsAt)[0]?._id ?? null
  );
}

export const adminStats = query({
  args: {},
  returns: v.object({
    totalPoints: v.number(),
    totalContributions: v.number(),
    totalPeopleReached: v.number(),
    pendingCount: v.number(),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const contributions = await ctx.db.query("contributions").collect();
    const approved = contributions.filter((c) => c.status === "approved");

    const totalPoints = approved.reduce(
      (sum, c) => sum + (c.awardedPoints ?? 0),
      0,
    );
    const totalPeopleReached = approved
      .filter((c) => c.kind === "people_reached")
      .reduce((sum, c) => sum + (c.quantity ?? 0), 0);
    const pendingCount = contributions.filter(
      (c) => c.status === "pending",
    ).length;

    return {
      totalPoints,
      totalContributions: approved.length,
      totalPeopleReached,
      pendingCount,
    };
  },
});

export const adminByKind = query({
  args: {},
  returns: v.array(
    v.object({
      kind: v.string(),
      count: v.number(),
    }),
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const contributions = await ctx.db.query("contributions").collect();
    const approved = contributions.filter((c) => c.status === "approved");

    const byKind = new Map<string, number>();
    for (const c of approved) {
      byKind.set(c.kind, (byKind.get(c.kind) ?? 0) + 1);
    }

    return [...byKind.entries()].map(([kind, count]) => ({ kind, count }));
  },
});

export const adminTimeline = query({
  args: {},
  returns: v.object({
    dateRange: v.object({
      min: v.number(),
      max: v.number(),
    }),
    data: v.array(
      v.object({
        date: v.string(),
        peopleReached: v.number(),
        contributions: v.number(),
      }),
    ),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [contributions, missions] = await Promise.all([
      ctx.db.query("contributions").collect(),
      ctx.db.query("missions").collect(),
    ]);

    const approved = contributions.filter((c) => c.status === "approved");

    const byDay = new Map<
      string,
      { peopleReached: number; contributions: number }
    >();
    for (const c of approved) {
      const day = new Date(c._creationTime).toISOString().slice(0, 10);
      const entry = byDay.get(day) ?? { peopleReached: 0, contributions: 0 };
      entry.contributions += 1;
      if (c.kind === "people_reached") {
        entry.peopleReached += c.quantity ?? 0;
      }
      byDay.set(day, entry);
    }

    const data = [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));

    const missionStarts = missions.map((m) => m.startsAt);
    const missionEnds = missions.map((m) => m.endsAt);
    const minDate =
      missionStarts.length > 0 ? Math.min(...missionStarts) : Date.now();
    const maxDate =
      missionEnds.length > 0 ? Math.max(...missionEnds) : Date.now();

    return {
      dateRange: { min: minDate, max: maxDate },
      data,
    };
  },
});

export const adminPending = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("contributions"),
      _creationTime: v.number(),
      ambassadorName: v.string(),
      title: v.string(),
      kind: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = Math.min(args.limit ?? 5, 20);
    const pending = await ctx.db
      .query("contributions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(limit);

    return await Promise.all(
      pending.map(async (c) => {
        const ambassador = await ctx.db.get(c.ambassadorId);
        return {
          _id: c._id,
          _creationTime: c._creationTime,
          ambassadorName: ambassador?.name?.trim() || "Ambassador",
          title: c.title,
          kind: c.kind,
        };
      }),
    );
  },
});
