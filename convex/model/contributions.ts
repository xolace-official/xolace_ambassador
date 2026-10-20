import { TableAggregate } from "@convex-dev/aggregate";
import { components } from "../_generated/api";
import type { DataModel, Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

type ContributionFields = Omit<Doc<"contributions">, "_id" | "_creationTime">;

// Contributions counted per status and keyed by submission time, so reports
// can count a status over any date range in O(log n). The sum carries people
// reached, which only the "people_reached" kind contributes. A status, kind or
// quantity change moves the row between namespaces or changes its sum, so
// every write must go through the helpers below.
export const contributionTotals = new TableAggregate<{
  Key: number;
  DataModel: DataModel;
  TableName: "contributions";
  Namespace: Doc<"contributions">["status"];
}>(components.contributionTotals, {
  namespace: (contribution) => contribution.status,
  sortKey: (contribution) => contribution._creationTime,
  sumValue: (contribution) =>
    contribution.kind === "people_reached" ? (contribution.quantity ?? 0) : 0,
});

export async function insertContribution(
  ctx: MutationCtx,
  contribution: ContributionFields,
) {
  const contributionId = await ctx.db.insert("contributions", contribution);
  const inserted = await ctx.db.get(contributionId);
  if (inserted !== null) await contributionTotals.insert(ctx, inserted);
  return contributionId;
}

export async function patchContribution(
  ctx: MutationCtx,
  contributionId: Id<"contributions">,
  fields: Partial<ContributionFields>,
) {
  const before = await ctx.db.get(contributionId);
  if (before === null) throw new Error("Contribution not found.");
  await ctx.db.patch(contributionId, fields);
  const after = await ctx.db.get(contributionId);
  if (after === null) return;
  // replaceOrInsert, not replace: rows written before the aggregate existed
  // may be patched before the backfill reaches them.
  await contributionTotals.replaceOrInsert(ctx, before, after);
}

export async function deleteContribution(
  ctx: MutationCtx,
  contributionId: Id<"contributions">,
) {
  const existing = await ctx.db.get(contributionId);
  if (existing === null) return;
  await ctx.db.delete(contributionId);
  await contributionTotals.deleteIfExists(ctx, existing);
}
