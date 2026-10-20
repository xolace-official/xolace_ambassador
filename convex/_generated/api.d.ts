/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ambassadors from "../ambassadors.js";
import type * as analytics from "../analytics.js";
import type * as applications from "../applications.js";
import type * as auth from "../auth.js";
import type * as contributionTotals from "../contributionTotals.js";
import type * as contributions from "../contributions.js";
import type * as crons from "../crons.js";
import type * as emailTemplates from "../emailTemplates.js";
import type * as http from "../http.js";
import type * as impact from "../impact.js";
import type * as leaderboard from "../leaderboard.js";
import type * as meetingSlots from "../meetingSlots.js";
import type * as meetings from "../meetings.js";
import type * as missionSets from "../missionSets.js";
import type * as missions from "../missions.js";
import type * as model_auth from "../model/auth.js";
import type * as model_contributions from "../model/contributions.js";
import type * as model_meetingSlots from "../model/meetingSlots.js";
import type * as model_pointLedger from "../model/pointLedger.js";
import type * as notifications from "../notifications.js";
import type * as pointLedger from "../pointLedger.js";
import type * as programConfig from "../programConfig.js";
import type * as provisioning from "../provisioning.js";
import type * as publicAmbassadors from "../publicAmbassadors.js";
import type * as reports from "../reports.js";
import type * as resources from "../resources.js";
import type * as rewards from "../rewards.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as users from "../users.js";
import type * as utils_uuid from "../utils/uuid.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ambassadors: typeof ambassadors;
  analytics: typeof analytics;
  applications: typeof applications;
  auth: typeof auth;
  contributionTotals: typeof contributionTotals;
  contributions: typeof contributions;
  crons: typeof crons;
  emailTemplates: typeof emailTemplates;
  http: typeof http;
  impact: typeof impact;
  leaderboard: typeof leaderboard;
  meetingSlots: typeof meetingSlots;
  meetings: typeof meetings;
  missionSets: typeof missionSets;
  missions: typeof missions;
  "model/auth": typeof model_auth;
  "model/contributions": typeof model_contributions;
  "model/meetingSlots": typeof model_meetingSlots;
  "model/pointLedger": typeof model_pointLedger;
  notifications: typeof notifications;
  pointLedger: typeof pointLedger;
  programConfig: typeof programConfig;
  provisioning: typeof provisioning;
  publicAmbassadors: typeof publicAmbassadors;
  reports: typeof reports;
  resources: typeof resources;
  rewards: typeof rewards;
  seed: typeof seed;
  settings: typeof settings;
  users: typeof users;
  "utils/uuid": typeof utils_uuid;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  pointLedgerTotals: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"pointLedgerTotals">;
  contributionTotals: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"contributionTotals">;
};
