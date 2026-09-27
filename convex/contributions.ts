import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { AuthError, requireRole } from "./model/auth";

export const submit = mutation({
  args: {
    missionId: v.id("missions"),
    note: v.string(),
    link: v.optional(v.string()),
    quantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // `ambassadorId` is deliberately not an argument. It is read from the token,
    // so a caller cannot submit work as somebody else.
    const user = await requireRole(ctx);

    const mission = await ctx.db.get(args.missionId);

    // 404 rather than a refusal, so a probe cannot tell a closed mission from
    // one that never existed.
    if (mission === null || mission.status !== "published") {
      throw new AuthError(404, "Not found.");
    }

    if (Date.now() > mission.endsAt) {
      throw new Error(
        "This mission has closed and is no longer accepting submissions.",
      );
    }

    // A rejected submission may be revised and sent again. Anything else is
    // already in the review queue.
    const latest = await ctx.db
      .query("contributions")
      .withIndex("by_ambassadorId_and_missionId", (q) =>
        q.eq("ambassadorId", user._id).eq("missionId", args.missionId),
      )
      .order("desc")
      .first();

    if (latest !== null && latest.status !== "rejected") {
      throw new Error("You already have a submission in for this mission.");
    }

    return await ctx.db.insert("contributions", {
      ambassadorId: user._id,
      missionId: args.missionId,
      kind: "mission_submission",
      quantity: args.quantity,
      // Taken from the mission so the ledger reads clearly later without asking
      // the ambassador to retype it.
      title: mission.title,
      note: args.note,
      link: args.link,
      status: "pending",
    });
  },
});
