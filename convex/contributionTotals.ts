import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { contributionTotals } from "./model/contributions";

// Adds contributions written before the aggregate existed. Run once per
// deployment: `npx convex run contributionTotals:backfillTotals`.
export const backfillTotals = internalMutation({
  args: { cursor: v.optional(v.union(v.string(), v.null())) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("contributions")
      .paginate({ cursor: args.cursor ?? null, numItems: 200 });
    for (const contribution of page.page) {
      await contributionTotals.insertIfDoesNotExist(ctx, contribution);
    }
    if (!page.isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.contributionTotals.backfillTotals,
        { cursor: page.continueCursor },
      );
    }
    return null;
  },
});
