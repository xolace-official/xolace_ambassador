import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { type QueryCtx, query } from "./_generated/server";
import { requireRole } from "./model/auth";
import { trackValidator } from "./schema";

// Never read the whole table: this grows every time a mission is published.
const MAX_MISSIONS = 60;

// One ambassador's own submission history, read once per query instead of once
// per mission. Bounded because a single ambassador's history stays small.
const MAX_OWN_SUBMISSIONS = 200;

type Submission = Doc<"contributions">;

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
