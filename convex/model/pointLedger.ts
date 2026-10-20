import { TableAggregate } from "@convex-dev/aggregate";
import { components } from "../_generated/api";
import type { DataModel, Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

// Running sum of ledger deltas keyed by creation time, so reports can total
// any date range in O(log n) instead of scanning the append-only ledger.
export const pointLedgerTotals = new TableAggregate<{
  Key: number;
  DataModel: DataModel;
  TableName: "pointLedger";
}>(components.pointLedgerTotals, {
  sortKey: (entry) => entry._creationTime,
  sumValue: (entry) => entry.delta,
});

// Every ledger write goes through here so the aggregate never drifts.
export async function insertLedgerEntry(
  ctx: MutationCtx,
  entry: Omit<Doc<"pointLedger">, "_id" | "_creationTime">,
) {
  const entryId = await ctx.db.insert("pointLedger", entry);
  const inserted = await ctx.db.get(entryId);
  if (inserted !== null) await pointLedgerTotals.insert(ctx, inserted);
  return entryId;
}
