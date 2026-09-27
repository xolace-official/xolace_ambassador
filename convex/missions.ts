import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, type QueryCtx, query } from "./_generated/server";
import { requireAdmin, requireRole } from "./model/auth";
import { trackValidator } from "./schema";

// Never read the whole table: this grows every time a mission is published.
const MAX_MISSIONS = 60;

// One ambassador's own submission history, read once per query instead of once
// per mission. Bounded because a single ambassador's history stays small.
const MAX_OWN_SUBMISSIONS = 200;
const adminMissionValidator = v.object({
  _id: v.id("missions"),
  _creationTime: v.number(),
  title: v.string(),
  slug: v.string(),
  summary: v.string(),
  description: v.string(),
  track: trackValidator,
  actionKey: v.optional(v.string()),
  points: v.number(),
  difficulty: v.union(
    v.literal("beginner"),
    v.literal("intermediate"),
    v.literal("advanced"),
  ),
  status: v.union(
    v.literal("draft"),
    v.literal("published"),
    v.literal("closed"),
  ),
  startsAt: v.number(),
  endsAt: v.number(),
  createdBy: v.id("users"),
  createdByName: v.string(),
  submissionFields: v.optional(
    v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        type: v.union(
          v.literal("short_text"),
          v.literal("long_text"),
          v.literal("url"),
          v.literal("number"),
        ),
        required: v.boolean(),
      }),
    ),
  ),
});

type Submission = Doc<"contributions">;

export const adminList = query({
  args: {
    paginationOpts: paginationOptsValidator,
    track: v.optional(trackValidator),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("published"), v.literal("closed")),
    ),
  },
  returns: paginationResultValidator(adminMissionValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { status, track } = args;
    const result =
      status !== undefined && track !== undefined
        ? await ctx.db
            .query("missions")
            .withIndex("by_status_and_track", (q) =>
              q.eq("status", status).eq("track", track),
            )
            .order("desc")
            .paginate(args.paginationOpts)
        : status !== undefined
          ? await ctx.db
              .query("missions")
              .withIndex("by_status", (q) => q.eq("status", status))
              .order("desc")
              .paginate(args.paginationOpts)
          : track !== undefined
            ? await ctx.db
                .query("missions")
                .withIndex("by_track", (q) => q.eq("track", track))
                .order("desc")
                .paginate(args.paginationOpts)
            : await ctx.db
                .query("missions")
                .order("desc")
                .paginate(args.paginationOpts);
    const missions = result.page;
    const creatorIds = [
      ...new Set(missions.map((mission) => mission.createdBy)),
    ];
    const creators = await Promise.all(
      creatorIds.map(async (id) => {
        const user = await ctx.db.get(id);
        return [id, user?.name?.trim() || "Former admin"] as const;
      }),
    );
    const creatorNames = new Map(creators);

    return {
      ...result,
      page: missions.map((mission) => ({
        ...mission,
        createdByName: creatorNames.get(mission.createdBy) ?? "Former admin",
      })),
    };
  },
});

export const adminGet = query({
  args: { missionId: v.string() },
  returns: v.union(adminMissionValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const id = ctx.db.normalizeId("missions", args.missionId);
    if (id === null) return null;

    const mission = await ctx.db.get(id);
    if (mission === null) return null;

    const creator = await ctx.db.get(mission.createdBy);
    return {
      ...mission,
      createdByName: creator?.name?.trim() || "Former admin",
    };
  },
});

export const adminCreate = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    description: v.string(),
    track: trackValidator,
    points: v.number(),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    status: v.union(v.literal("draft"), v.literal("published")),
    endsAt: v.number(),
    submissionFields: v.optional(
      v.array(
        v.object({
          label: v.string(),
          type: v.union(
            v.literal("short_text"),
            v.literal("long_text"),
            v.literal("url"),
            v.literal("number"),
          ),
          required: v.boolean(),
        }),
      ),
    ),
  },
  returns: v.id("missions"),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    if (args.title.trim().length < 3) {
      throw new Error("Enter a mission title with at least 3 characters.");
    }

    if (args.summary.trim().length < 20) {
      throw new Error("Add a short summary with at least 20 characters.");
    }

    if (args.description.trim().length < 30) {
      throw new Error("Add a mission brief with at least 30 characters.");
    }

    if (!Number.isSafeInteger(args.points) || args.points < 1) {
      throw new Error("Enter a whole number of points greater than zero.");
    }

    const submissionFields = args.submissionFields ?? [];
    if (submissionFields.length > 6) {
      throw new Error("Add no more than 6 submission fields.");
    }

    const normalizedLabels = submissionFields.map((field) =>
      field.label.trim().toLowerCase(),
    );
    if (
      submissionFields.some(
        (field) =>
          field.label.trim().length < 2 || field.label.trim().length > 80,
      ) ||
      new Set(normalizedLabels).size !== normalizedLabels.length
    ) {
      throw new Error(
        "Use unique submission field labels with at least 2 characters.",
      );
    }

    const now = Date.now();

    if (args.endsAt <= now) {
      throw new Error("Choose a deadline in the future.");
    }

    const slugBase = args.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return await ctx.db.insert("missions", {
      title: args.title.trim(),
      slug: `${slugBase || "mission"}-${crypto.randomUUID().slice(0, 8)}`,
      summary: args.summary.trim(),
      description: args.description.trim(),
      track: args.track,
      points: args.points,
      difficulty: args.difficulty,
      status: args.status,
      startsAt: now,
      endsAt: args.endsAt,
      createdBy: admin._id,
      submissionFields: submissionFields.map((field, index) => ({
        ...field,
        key: `field-${index + 1}`,
        label: field.label.trim(),
      })),
    });
  },
});

export type OpenState = "available" | "expired";

function openState(mission: Doc<"missions">, now: number): OpenState {
  return now > mission.endsAt ? "expired" : "available";
}

// Newest submission per mission. The index is ordered by `_creationTime`, so
// descending order means the first row seen for a mission is its latest.
async function latestByMission(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<Map<Id<"missions">, Submission>> {
  const rows = await ctx.db
    .query("contributions")
    .withIndex("by_ambassadorId", (q) => q.eq("ambassadorId", userId))
    .order("desc")
    .take(MAX_OWN_SUBMISSIONS);

  const byMission = new Map<Id<"missions">, Submission>();

  for (const row of rows) {
    if (row.missionId !== undefined && !byMission.has(row.missionId)) {
      byMission.set(row.missionId, row);
    }
  }

  return byMission;
}

export const list = query({
  args: {
    track: v.optional(trackValidator),
    // The wall clock is an argument, not `Date.now()` in here — a query is not
    // re-run when time passes, so a deadline would silently go stale.
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx);

    const { track } = args;

    const rows =
      track === undefined
        ? await ctx.db
            .query("missions")
            .withIndex("by_status", (q) => q.eq("status", "published"))
            .order("desc")
            .take(MAX_MISSIONS)
        : await ctx.db
            .query("missions")
            .withIndex("by_status_and_track", (q) =>
              q.eq("status", "published").eq("track", track),
            )
            .order("desc")
            .take(MAX_MISSIONS);

    const mine = await latestByMission(ctx, user._id);

    return rows.map((mission) => ({
      ...mission,
      openState: openState(mission, args.now),
      submission: mine.get(mission._id) ?? null,
    }));
  },
});

export const get = query({
  args: { missionId: v.string(), now: v.number() },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx);

    // A hand-edited url can hold any string, and `v.id()` would reject the whole
    // call with a validation error instead of a clean miss. Normalising first
    // turns a bad id into `null`.
    const id = ctx.db.normalizeId("missions", args.missionId);

    if (id === null) {
      return null;
    }

    const mission = await ctx.db.get(id);

    if (mission === null) {
      return null;
    }

    // Ambassadors only ever see published work. Admins can open a draft they
    // are still writing.
    if (mission.status !== "published" && user.role !== "admin") {
      return null;
    }

    const mine = await latestByMission(ctx, user._id);

    return {
      ...mission,
      openState: openState(mission, args.now),
      submission: mine.get(mission._id) ?? null,
    };
  },
});
