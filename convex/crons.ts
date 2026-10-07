import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "promote the next mission set",
  { minutes: 1 },
  internal.missionSets.promoteNextSet,
);

export default crons;
