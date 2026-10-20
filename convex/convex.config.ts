import aggregate from "@convex-dev/aggregate/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(aggregate, { name: "pointLedgerTotals" });
app.use(aggregate, { name: "contributionTotals" });

export default app;
