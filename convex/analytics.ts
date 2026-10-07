import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./model/auth";

export const getAnalytics = query({
  args: {},
  returns: v.object({
    summary: v.object({
      totalPoints: v.number(),
      totalContributions: v.number(),
      totalPeopleReached: v.number(),
      pendingReviews: v.number(),
      totalAmbassadors: v.number(),
      activeMissions: v.number(),
    }),
    timeline: v.array(
      v.object({
        date: v.string(),
        points: v.number(),
        contributions: v.number(),
        peopleReached: v.number(),
      }),
    ),
    byTrack: v.array(
      v.object({
        track: v.string(),
        count: v.number(),
        points: v.number(),
      }),
    ),
    byKind: v.array(
      v.object({
        kind: v.string(),
        count: v.number(),
      }),
    ),
    byLevel: v.array(
      v.object({
        level: v.string(),
        count: v.number(),
      }),
    ),
    byLocation: v.array(
      v.object({
        location: v.string(),
        count: v.number(),
      }),
    ),
    recentActivity: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        title: v.string(),
        subtitle: v.string(),
        time: v.number(),
      }),
    ),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [contributions, ambassadors, missions, profiles] = await Promise.all([
      ctx.db.query("contributions").collect(),
      ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "ambassador"))
        .collect(),
      ctx.db.query("missions").collect(),
      ctx.db.query("ambassadorProfiles").collect(),
    ]);

    const approved = contributions.filter((c) => c.status === "approved");
    const pending = contributions.filter((c) => c.status === "pending");

    const totalPoints = approved.reduce(
      (sum, c) => sum + (c.awardedPoints ?? 0),
      0,
    );
    const totalPeopleReached = approved
      .filter((c) => c.kind === "people_reached")
      .reduce((sum, c) => sum + (c.quantity ?? 0), 0);

    const byDay = new Map<
      string,
      { points: number; contributions: number; peopleReached: number }
    >();
    for (const c of approved) {
      const day = new Date(c._creationTime).toISOString().slice(0, 10);
      const entry = byDay.get(day) ?? {
        points: 0,
        contributions: 0,
        peopleReached: 0,
      };
      entry.points += c.awardedPoints ?? 0;
      entry.contributions += 1;
      if (c.kind === "people_reached") {
        entry.peopleReached += c.quantity ?? 0;
      }
      byDay.set(day, entry);
    }

    const timeline = [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));

    const trackMap = new Map<string, { count: number; points: number }>();
    for (const c of approved) {
      const mission = c.missionId
        ? missions.find((m) => m._id === c.missionId)
        : null;
      const track = mission?.track ?? "other";
      const entry = trackMap.get(track) ?? { count: 0, points: 0 };
      entry.count += 1;
      entry.points += c.awardedPoints ?? 0;
      trackMap.set(track, entry);
    }
    const byTrack = [...trackMap.entries()].map(([track, data]) => ({
      track,
      ...data,
    }));

    const kindMap = new Map<string, number>();
    for (const c of approved) {
      kindMap.set(c.kind, (kindMap.get(c.kind) ?? 0) + 1);
    }
    const byKind = [...kindMap.entries()].map(([kind, count]) => ({
      kind,
      count,
    }));

    const levelMap = new Map<string, number>();
    for (const a of ambassadors) {
      const profile = profiles.find((p) => p.userId === a._id);
      const totals = await ctx.db
        .query("ambassadorTotals")
        .withIndex("by_userId", (q) => q.eq("userId", a._id))
        .first();
      const level = totals?.levelRank ?? 0;
      const levelName = `Level ${level}`;
      levelMap.set(levelName, (levelMap.get(levelName) ?? 0) + 1);
    }
    const byLevel = [...levelMap.entries()].map(([level, count]) => ({
      level,
      count,
    }));

    const locationMap = new Map<string, number>();
    for (const p of profiles) {
      const loc = p.location ?? "Unknown";
      locationMap.set(loc, (locationMap.get(loc) ?? 0) + 1);
    }
    const byLocation = [...locationMap.entries()]
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentActivity = contributions
      .slice()
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 5)
      .map((c) => {
        const ambassador = ambassadors.find((a) => a._id === c.ambassadorId);
        return {
          id: c._id,
          type: c.kind,
          title: c.title,
          subtitle: ambassador?.name?.trim() || "Ambassador",
          time: c._creationTime,
        };
      });

    return {
      summary: {
        totalPoints,
        totalContributions: approved.length,
        totalPeopleReached,
        pendingReviews: pending.length,
        totalAmbassadors: ambassadors.length,
        activeMissions: missions.filter((m) => m.status === "published").length,
      },
      timeline,
      byTrack,
      byKind,
      byLevel,
      byLocation,
      recentActivity,
    };
  },
});
