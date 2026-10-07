import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
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
  missionSetId: v.union(v.id("missionSets"), v.null()),
  missionSetName: v.union(v.string(), v.null()),
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
    missionSetId: v.optional(v.id("missionSets")),
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
      args.missionSetId !== undefined
        ? await ctx.db
            .query("missions")
            .withIndex("by_missionSetId", (q) =>
              q.eq("missionSetId", args.missionSetId),
            )
            .order("desc")
            .paginate(args.paginationOpts)
        : status !== undefined && track !== undefined
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
    const missionSets = await Promise.all(
      missions.map(
        async (mission) =>
          [
            mission._id,
            mission.missionSetId === undefined
              ? null
              : await ctx.db.get(mission.missionSetId),
          ] as const,
      ),
    );
    const setByMission = new Map(missionSets);

    return {
      ...result,
      page: missions.map((mission) => ({
        ...mission,
        createdByName: creatorNames.get(mission.createdBy) ?? "Former admin",
        missionSetId: mission.missionSetId ?? null,
        missionSetName: setByMission.get(mission._id)?.name ?? null,
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
    const missionSet =
      mission.missionSetId === undefined
        ? null
        : await ctx.db.get(mission.missionSetId);
    return {
      ...mission,
      missionSetId: mission.missionSetId ?? null,
      missionSetName: missionSet?.name ?? null,
      createdByName: creator?.name?.trim() || "Former admin",
    };
  },
});

export const adminCreate = mutation({
  args: {
    title: v.string(),
    missionSetId: v.id("missionSets"),
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
    const missionSet = await ctx.db.get(args.missionSetId);

    if (missionSet === null) {
      throw new Error("Choose a valid mission set.");
    }

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

    if (missionSet.endsAt <= now) {
      throw new Error("Choose a mission set that has not ended.");
    }

    const slugBase = args.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const missionId = await ctx.db.insert("missions", {
      missionSetId: args.missionSetId,
      title: args.title.trim(),
      slug: `${slugBase || "mission"}-${crypto.randomUUID().slice(0, 8)}`,
      summary: args.summary.trim(),
      description: args.description.trim(),
      track: args.track,
      points: args.points,
      difficulty: args.difficulty,
      status: args.status,
      startsAt: missionSet.startsAt,
      endsAt: missionSet.endsAt,
      createdBy: admin._id,
      submissionFields: submissionFields.map((field, index) => ({
        ...field,
        key: `field-${index + 1}`,
        label: field.label.trim(),
      })),
    });
    if (
      args.status === "published" &&
      missionSet.status === "published" &&
      missionSet.startsAt <= Date.now() &&
      missionSet.endsAt >= Date.now()
    ) {
      await ctx.runMutation(internal.notifications.createForAmbassadors, {
        kind: "mission",
        title: "A new mission is available",
        description: `${args.title.trim()} is ready for your contribution.`,
        href: "/missions",
      });
    }
    return missionId;
  },
});

export const adminUpdate = mutation({
  args: {
    missionId: v.id("missions"),
    title: v.string(),
    missionSetId: v.id("missionSets"),
    summary: v.string(),
    description: v.string(),
    track: trackValidator,
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
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const mission = await ctx.db.get(args.missionId);
    const missionSet = await ctx.db.get(args.missionSetId);

    if (mission === null || missionSet === null) {
      throw new Error("Mission or mission set not found.");
    }
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

    await ctx.db.patch(args.missionId, {
      title: args.title.trim(),
      missionSetId: args.missionSetId,
      summary: args.summary.trim(),
      description: args.description.trim(),
      track: args.track,
      points: args.points,
      difficulty: args.difficulty,
      status: args.status,
      startsAt: missionSet.startsAt,
      endsAt: missionSet.endsAt,
      submissionFields: submissionFields.map((field, index) => ({
        ...field,
        key: `field-${index + 1}`,
        label: field.label.trim(),
      })),
    });
    if (
      args.status === "published" &&
      missionSet.status === "published" &&
      missionSet.startsAt <= Date.now() &&
      missionSet.endsAt >= Date.now()
    ) {
      await ctx.runMutation(internal.notifications.createForAmbassadors, {
        kind: "mission",
        title: "A mission was updated",
        description: `${args.title.trim()} has new details to review.`,
        href: "/missions",
      });
    }
    return null;
  },
});

export type OpenState = "available" | "expired";

function openState(mission: Doc<"missions">, now: number): OpenState {
  return now > mission.endsAt ? "expired" : "available";
}

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

    const activeSetId = await visibleMissionSetId(ctx, args.now);
    const activeRows = [];
    for (const mission of rows) {
      if (mission.missionSetId === undefined) {
        if (
          activeSetId === null &&
          mission.startsAt <= args.now &&
          mission.endsAt >= args.now
        ) {
          activeRows.push(mission);
        }
        continue;
      }

      if (mission.missionSetId === activeSetId) {
        activeRows.push(mission);
      }
    }

    const mine = await latestByMission(ctx, user._id);

    return Promise.all(
      activeRows.map(async (mission) => {
        const missionSet =
          mission.missionSetId === undefined
            ? null
            : await ctx.db.get(mission.missionSetId);

        return {
          ...mission,
          startsAt: missionSet?.startsAt ?? mission.startsAt,
          endsAt: missionSet?.endsAt ?? mission.endsAt,
          openState: openState(mission, args.now),
          submission: mine.get(mission._id) ?? null,
        };
      }),
    );
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

    if (mission.missionSetId !== undefined && user.role !== "admin") {
      const activeSetId = await visibleMissionSetId(ctx, args.now);
      if (activeSetId !== mission.missionSetId) {
        return null;
      }
    }

    if (
      mission.missionSetId === undefined &&
      user.role !== "admin" &&
      (mission.startsAt > args.now || mission.endsAt < args.now)
    ) {
      return null;
    }

    const mine = await latestByMission(ctx, user._id);

    const missionSet =
      mission.missionSetId === undefined
        ? null
        : await ctx.db.get(mission.missionSetId);

    return {
      ...mission,
      startsAt: missionSet?.startsAt ?? mission.startsAt,
      endsAt: missionSet?.endsAt ?? mission.endsAt,
      openState: openState(mission, args.now),
      submission: mine.get(mission._id) ?? null,
    };
  },
});
