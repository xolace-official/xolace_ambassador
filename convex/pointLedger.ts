import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { pointLedgerTotals } from "./model/pointLedger";

// Adds ledger rows written before the aggregate existed. Run once per
// deployment: `npx convex run pointLedger:backfillTotals`.
export const backfillTotals = internalMutation({
  args: { cursor: v.optional(v.union(v.string(), v.null())) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("pointLedger")
      .paginate({ cursor: args.cursor ?? null, numItems: 200 });
    for (const entry of page.page) {
      await pointLedgerTotals.insertIfDoesNotExist(ctx, entry);
    }
    if (!page.isDone) {
      await ctx.scheduler.runAfter(0, internal.pointLedger.backfillTotals, {
        cursor: page.continueCursor,
      });
    }
    return null;
  },
});
