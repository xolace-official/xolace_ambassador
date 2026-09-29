import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./model/auth";

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
