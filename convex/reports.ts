import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./model/auth";

const reportTypeValidator = v.union(
  v.literal("ambassadors"),
  v.literal("missions"),
  v.literal("contributions"),
  v.literal("resources"),
  v.literal("events"),
  v.literal("recognitions"),
  v.literal("applications"),
);

const statusValidator = v.union(
  v.literal("all"),
  v.literal("active"),
  v.literal("paused"),
  v.literal("suspended"),
  v.literal("draft"),
  v.literal("published"),
  v.literal("closed"),
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("declined"),
  v.literal("new"),
  v.literal("reviewing"),
  v.literal("accepted"),
);
const periodValidator = v.union(
  v.literal("all"),
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("monthly"),
  v.literal("yearly"),
);

export const getReports = query({
  args: {
    reportType: v.optional(reportTypeValidator),
    status: v.optional(statusValidator),
    search: v.optional(v.string()),
    period: v.optional(periodValidator),
  },
  returns: v.object({
    summary: v.object({
      totalAmbassadors: v.number(),
      activeMissions: v.number(),
      pendingReviews: v.number(),
      totalPoints: v.number(),
      totalContributions: v.number(),
      totalPeopleReached: v.number(),
    }),
    ambassadors: v.array(
      v.object({
        userId: v.id("users"),
        name: v.string(),
        track: v.union(
          v.literal("creator"),
          v.literal("community"),
          v.literal("growth"),
          v.literal("creative"),
          v.literal("production"),
          v.literal("advocacy"),
          v.null(),
        ),
        status: v.union(
          v.literal("active"),
          v.literal("paused"),
          v.literal("suspended"),
        ),
        points: v.number(),
        contributionsApproved: v.number(),
        missionsCompleted: v.number(),
        peopleReached: v.number(),
        lastActivityAt: v.union(v.number(), v.null()),
      }),
    ),
    missions: v.array(
      v.object({
        missionId: v.id("missions"),
        title: v.string(),
        status: v.union(
          v.literal("draft"),
          v.literal("published"),
          v.literal("closed"),
        ),
        track: v.union(
          v.literal("creator"),
          v.literal("community"),
          v.literal("growth"),
          v.literal("creative"),
          v.literal("production"),
          v.literal("advocacy"),
        ),
        submissions: v.number(),
        approved: v.number(),
        rejected: v.number(),
        pointsAwarded: v.number(),
      }),
    ),
    contributions: v.array(
      v.object({
        contributionId: v.id("contributions"),
        ambassadorName: v.string(),
        missionTitle: v.union(v.string(), v.null()),
        kind: v.string(),
        status: v.union(
          v.literal("pending"),
          v.literal("approved"),
          v.literal("rejected"),
          v.literal("declined"),
        ),
        quantity: v.union(v.number(), v.null()),
        awardedPoints: v.union(v.number(), v.null()),
        createdAt: v.number(),
      }),
    ),
    resources: v.array(
      v.object({
        resourceId: v.id("resources"),
        title: v.string(),
        category: v.string(),
        kind: v.string(),
        published: v.boolean(),
        track: v.union(
          v.literal("creator"),
          v.literal("community"),
          v.literal("growth"),
          v.literal("creative"),
          v.literal("production"),
          v.literal("advocacy"),
          v.null(),
        ),
      }),
    ),
    events: v.array(
      v.object({
        eventId: v.id("events"),
        title: v.string(),
        format: v.union(v.literal("online"), v.literal("in_person")),
        startsAt: v.number(),
        location: v.union(v.string(), v.null()),
      }),
    ),
    recognitions: v.array(
      v.object({
        recognitionId: v.id("recognitions"),
        userName: v.string(),
        kind: v.string(),
        note: v.string(),
        awardedAt: v.number(),
      }),
    ),
    applications: v.array(
      v.object({
        applicationId: v.id("applications"),
        name: v.string(),
        email: v.string(),
        trackInterest: v.union(
          v.literal("creator"),
          v.literal("community"),
          v.literal("growth"),
          v.literal("creative"),
          v.literal("production"),
          v.literal("advocacy"),
        ),
        status: v.union(
          v.literal("new"),
          v.literal("reviewing"),
          v.literal("accepted"),
          v.literal("rejected"),
        ),
        appliedAt: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const reportType = args.reportType ?? "ambassadors";
    const status = args.status ?? "all";
    const search = args.search?.trim().toLowerCase();
    const periodStart = getPeriodStart(args.period ?? "all");
    const inPeriod = (timestamp: number) =>
      periodStart === null || timestamp >= periodStart;

    const [
      ambassadors,
      missions,
      contributions,
      resources,
      events,
      recognitions,
      applications,
    ] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "ambassador"))
        .take(500),
      ctx.db.query("missions").take(1000),
      ctx.db.query("contributions").take(5000),
      ctx.db.query("resources").take(500),
      ctx.db.query("events").take(500),
      ctx.db.query("recognitions").take(500),
      ctx.db.query("applications").take(500),
    ]);

    const ambassadorRows = await Promise.all(
      ambassadors.map(async (a) => {
        const [profile, totals] = await Promise.all([
          ctx.db
            .query("ambassadorProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", a._id))
            .first(),
          ctx.db
            .query("ambassadorTotals")
            .withIndex("by_userId", (q) => q.eq("userId", a._id))
            .first(),
        ]);
        return {
          userId: a._id,
          name: a.name?.trim() || "Ambassador",
          track: profile?.track ?? null,
          status: profile?.status ?? "active",
          points: totals?.points ?? 0,
          contributionsApproved: totals?.contributionsApproved ?? 0,
          missionsCompleted: totals?.missionsCompleted ?? 0,
          peopleReached: totals?.peopleReached ?? 0,
          lastActivityAt: null,
        };
      }),
    );

    const missionRows = missions.map((m) => {
      const missionContributions = contributions.filter(
        (c) => c.missionId === m._id,
      );
      const approved = missionContributions.filter(
        (c) => c.status === "approved",
      );
      return {
        missionId: m._id,
        title: m.title,
        status: m.status,
        track: m.track,
        submissions: missionContributions.length,
        approved: approved.length,
        rejected: missionContributions.filter((c) => c.status === "rejected")
          .length,
        pointsAwarded: approved.reduce(
          (sum, c) => sum + (c.awardedPoints ?? 0),
          0,
        ),
      };
    });

    const contributionRows = await Promise.all(
      contributions.map(async (c) => {
        const ambassador = await ctx.db.get(c.ambassadorId);
        const mission = c.missionId ? await ctx.db.get(c.missionId) : null;
        return {
          contributionId: c._id,
          ambassadorName: ambassador?.name?.trim() || "Ambassador",
          missionTitle: mission?.title ?? null,
          kind: c.kind,
          status: c.status,
          quantity: c.quantity ?? null,
          awardedPoints: c.awardedPoints ?? null,
          createdAt: c._creationTime,
        };
      }),
    );

    const resourceRows = resources.map((r) => ({
      resourceId: r._id,
      title: r.title,
      category: r.category,
      kind: r.kind,
      published: r.published,
      track: r.track ?? null,
    }));

    const eventRows = events.map((e) => ({
      eventId: e._id,
      title: e.title,
      format: e.format,
      startsAt: e.startsAt,
      location: e.location ?? null,
    }));

    const recognitionRows = await Promise.all(
      recognitions.map(async (r) => {
        const user = await ctx.db.get(r.userId);
        return {
          recognitionId: r._id,
          userName: user?.name?.trim() || "Ambassador",
          kind: r.kind,
          note: r.note,
          awardedAt: r._creationTime,
        };
      }),
    );

    const applicationRows = applications.map((a) => ({
      applicationId: a._id,
      name: a.name,
      email: a.email,
      trackInterest: a.trackInterest,
      status: a.status,
      appliedAt: a._creationTime,
    }));

    const matches = (...values: Array<string | null | undefined>) =>
      !search || values.some((value) => value?.toLowerCase().includes(search));
    const ambassadorReport = ambassadorRows.filter(
      (row) =>
        (status === "all" || row.status === status) &&
        matches(row.name, row.track),
    );
    const missionReport = missionRows.filter(
      (row) =>
        (status === "all" || row.status === status) &&
        matches(row.title, row.track),
    );
    const contributionReport = contributionRows.filter(
      (row) =>
        (status === "all" || row.status === status) &&
        inPeriod(row.createdAt) &&
        matches(row.ambassadorName, row.missionTitle, row.kind),
    );
    const resourceReport = resourceRows.filter(
      (row) =>
        (status === "all" || (status === "published" && row.published)) &&
        matches(row.title, row.category, row.kind, row.track),
    );
    const eventReport = eventRows.filter((row) =>
      matches(row.title, row.format, row.location),
    );
    const recognitionReport = recognitionRows.filter(
      (row) =>
        inPeriod(row.awardedAt) && matches(row.userName, row.kind, row.note),
    );
    const applicationReport = applicationRows.filter(
      (row) =>
        (status === "all" || row.status === status) &&
        inPeriod(row.appliedAt) &&
        matches(row.name, row.email, row.trackInterest),
    );

    const approvedContributions = contributions.filter(
      (c) => c.status === "approved",
    );

    return {
      summary: {
        totalAmbassadors: ambassadors.length,
        activeMissions: missions.filter((m) => m.status === "published").length,
        pendingReviews: contributions.filter((c) => c.status === "pending")
          .length,
        totalPoints: approvedContributions.reduce(
          (sum, c) => sum + (c.awardedPoints ?? 0),
          0,
        ),
        totalContributions: approvedContributions.length,
        totalPeopleReached: approvedContributions
          .filter((c) => c.kind === "people_reached")
          .reduce((sum, c) => sum + (c.quantity ?? 0), 0),
      },
      ambassadors:
        reportType === "ambassadors"
          ? ambassadorReport.sort((a, b) => b.points - a.points)
          : [],
      missions:
        reportType === "missions"
          ? missionReport.sort((a, b) => b.submissions - a.submissions)
          : [],
      contributions:
        reportType === "contributions"
          ? contributionReport.sort((a, b) => b.createdAt - a.createdAt)
          : [],
      resources:
        reportType === "resources"
          ? resourceReport.sort((a, b) => a.title.localeCompare(b.title))
          : [],
      events:
        reportType === "events"
          ? eventReport.sort((a, b) => b.startsAt - a.startsAt)
          : [],
      recognitions:
        reportType === "recognitions"
          ? recognitionReport.sort((a, b) => b.awardedAt - a.awardedAt)
          : [],
      applications:
        reportType === "applications"
          ? applicationReport.sort((a, b) => b.appliedAt - a.appliedAt)
          : [],
    };
  },
});

function getPeriodStart(
  period: "all" | "daily" | "weekly" | "monthly" | "yearly",
) {
  if (period === "all") return null;
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  if (period === "daily") return start.getTime();
  if (period === "weekly") return start.getTime() - 6 * 86_400_000;
  if (period === "monthly") {
    start.setUTCDate(1);
    return start.getTime();
  }
  start.setUTCMonth(0, 1);
  return start.getTime();
}
