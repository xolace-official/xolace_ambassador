import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The six program tracks. Declared once here and reused by every table that
// needs the union, so adding a track is a one-line change.
export const trackValidator = v.union(
  v.literal("creator"),
  v.literal("community"),
  v.literal("growth"),
  v.literal("creative"),
  v.literal("production"),
  v.literal("advocacy"),
);

const track = trackValidator;

const missionSubmissionFieldTypeValidator = v.union(
  v.literal("short_text"),
  v.literal("long_text"),
  v.literal("url"),
  v.literal("number"),
);

const missionSubmissionFieldValidator = v.object({
  key: v.string(),
  label: v.string(),
  type: missionSubmissionFieldTypeValidator,
  required: v.boolean(),
});

const contributionResponseValidator = v.object({
  fieldKey: v.string(),
  label: v.string(),
  value: v.string(),
});

export default defineSchema({
  // Convex Auth writes to `authSessions`, `authAccounts`, `authRefreshTokens`,
  // `authVerificationCodes`, `authVerifiers` and `authRateLimits` on every
  // sign-in / refresh / rate-limit check. These must be mounted or auth throws.
  ...authTables,

  // The portal's own fields, extended onto the auth users table.
  //
  // Convex Auth inserts this row itself during sign-up, so every field we add
  // beyond the auth fields has to be optional — a required field here makes
  // every sign-up fail validation.
  //
  // This stays the *auth* row. Program data lives in `ambassadorProfiles` so
  // that churn in points and level never contends with a sign-in read.
  users: defineTable(
    authTables.users.validator.extend({
      uuid: v.optional(v.string()),
      role: v.optional(v.union(v.literal("admin"), v.literal("ambassador"))),
    }),
  )
    .index("uuid", ["uuid"])
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_role", ["role"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["role"],
    }),

  // ---------------------------------------------------------------------------
  // Program configuration — admin-editable, so thresholds and point values can
  // be retuned without a deploy.
  // ---------------------------------------------------------------------------

  levels: defineTable({
    rank: v.number(),
    key: v.string(),
    name: v.string(),
    minPoints: v.number(),
    description: v.string(),
  })
    .index("by_key", ["key"])
    .index("by_rank", ["rank"])
    .index("by_minPoints", ["minPoints"]),

  // The bounded vocabulary of awardable reasons. Admin award and manual
  // adjustment pick from this list instead of accepting free text, which keeps
  // the ledger readable and stops typo'd reasons.
  pointActions: defineTable({
    key: v.string(),
    label: v.string(),
    points: v.number(),
    description: v.string(),
    track: v.optional(track),
    active: v.boolean(),
  })
    .index("by_key", ["key"])
    .index("by_track", ["track"]),

  pods: defineTable({
    name: v.string(),
    slug: v.string(),
    kind: v.union(
      v.literal("growth"),
      v.literal("community"),
      v.literal("production"),
    ),
    description: v.string(),
    leadUserId: v.optional(v.id("users")),
    active: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_kind", ["kind"])
    .index("by_leadUserId", ["leadUserId"]),

  // ---------------------------------------------------------------------------
  // People
  // ---------------------------------------------------------------------------

  ambassadorProfiles: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("suspended"),
    ),
    track: v.optional(track),
    podId: v.optional(v.id("pods")),
    location: v.optional(v.string()),
    school: v.optional(v.string()),
    bio: v.optional(v.string()),
    socials: v.optional(
      v.object({
        tiktok: v.optional(v.string()),
        instagram: v.optional(v.string()),
        x: v.optional(v.string()),
        youtube: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        snapchat: v.optional(v.string()),
      }),
    ),
    // Mandatory safety and ethics acknowledgement. Left optional so an
    // existing account is never blocked from signing in, but the portal gates
    // contribution on it being set.
    safetyAcknowledgedAt: v.optional(v.number()),
    onboardedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_track", ["track"])
    .index("by_podId", ["podId"]),

  // Denormalised rollup, one row per ambassador. Written in the same mutation
  // as every `pointLedger` insert so the two can never drift, and indexed on
  // `points` so the leaderboard is an O(1) range read rather than a sort.
  ambassadorTotals: defineTable({
    userId: v.id("users"),
    points: v.number(),
    levelRank: v.number(),
    contributionsApproved: v.number(),
    missionsCompleted: v.number(),
    peopleReached: v.number(),
    installs: v.number(),
    referrals: v.number(),
    contentCount: v.number(),
    eventCount: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_points", ["points"]),

  // Append-only award history. Never updated — a correction is a new row with
  // the opposite delta, so the audit trail stays intact.
  pointLedger: defineTable({
    ambassadorId: v.id("users"),
    delta: v.number(),
    reason: v.string(),
    actionKey: v.optional(v.string()),
    missionId: v.optional(v.id("missions")),
    contributionId: v.optional(v.id("contributions")),
    awardedBy: v.optional(v.id("users")),
  })
    .index("by_ambassadorId", ["ambassadorId"])
    .index("by_contributionId", ["contributionId"]),

  // ---------------------------------------------------------------------------
  // Missions and contributions
  // ---------------------------------------------------------------------------

  missions: defineTable({
    title: v.string(),
    // Stable handle for seeding and future share links. The url uses `_id`.
    slug: v.string(),
    summary: v.string(),
    description: v.string(),
    track: track,
    // Source of the points value at creation time. The `points` below is a
    // deliberate snapshot, not a live join: raising an action's value later
    // must not retroactively change what an ambassador already earned.
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
    submissionFields: v.optional(v.array(missionSubmissionFieldValidator)),
  })
    .index("by_status", ["status"])
    .index("by_slug", ["slug"])
    .index("by_title", ["title"])
    .index("by_track", ["track"])
    .index("by_status_and_track", ["status", "track"])
    .index("by_createdBy", ["createdBy"]),

  // One table for both a mission submission and a self-reported impact number.
  // They are the same workflow — report, admin review, points awarded — so
  // splitting them would duplicate the review state machine for no gain.
  // Nothing here counts until an admin approves it.
  contributions: defineTable({
    ambassadorId: v.id("users"),
    missionId: v.optional(v.id("missions")),
    kind: v.union(
      v.literal("mission_submission"),
      v.literal("people_reached"),
      v.literal("app_install"),
      v.literal("referral"),
      v.literal("content"),
      v.literal("event"),
      v.literal("other"),
    ),
    // Summed for the countable kinds (people_reached, app_install, referral);
    // treated as 1 for content and event.
    quantity: v.optional(v.number()),
    title: v.string(),
    note: v.optional(v.string()),
    link: v.optional(v.string()),
    responses: v.optional(v.array(contributionResponseValidator)),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("declined"),
    ),
    awardedPoints: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    reviewNote: v.optional(v.string()),
  })
    .index("by_ambassadorId", ["ambassadorId"])
    .index("by_ambassadorId_and_missionId", ["ambassadorId", "missionId"])
    .index("by_ambassadorId_and_status", ["ambassadorId", "status"])
    .index("by_missionId", ["missionId"])
    .index("by_status", ["status"])
    .index("by_status_and_kind", ["status", "kind"]),

  // ---------------------------------------------------------------------------
  // Community
  // ---------------------------------------------------------------------------

  resources: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("brand_kit"),
      v.literal("templates"),
      v.literal("videos"),
      v.literal("campaign_assets"),
      v.literal("captions"),
      v.literal("screenshots"),
      v.literal("guide"),
    ),
    kind: v.union(v.literal("link"), v.literal("file")),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    track: v.optional(track),
    published: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_published", ["published"])
    .index("by_category", ["category"]),

  announcements: defineTable({
    authorId: v.id("users"),
    title: v.string(),
    body: v.string(),
    audience: v.union(
      v.literal("all"),
      v.literal("ambassadors"),
      v.literal("admins"),
    ),
    pinned: v.boolean(),
  })
    .index("by_audience", ["audience"])
    .index("by_pinned", ["pinned"]),

  events: defineTable({
    title: v.string(),
    description: v.string(),
    format: v.union(v.literal("online"), v.literal("in_person")),
    location: v.optional(v.string()),
    url: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.number(),
    capacity: v.optional(v.number()),
    createdBy: v.id("users"),
  })
    .index("by_startsAt", ["startsAt"])
    .index("by_createdBy", ["createdBy"]),

  // Child rows rather than an array on `events`, so an RSVP does not rewrite
  // the whole event document.
  eventRsvps: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    status: v.union(v.literal("going"), v.literal("interested")),
  })
    .index("by_eventId", ["eventId"])
    .index("by_userId", ["userId"]),

  recognitions: defineTable({
    userId: v.id("users"),
    kind: v.union(
      v.literal("spotlight"),
      v.literal("featured"),
      v.literal("pod_lead"),
      v.literal("fellowship"),
    ),
    note: v.string(),
    awardedBy: v.id("users"),
  })
    .index("by_userId", ["userId"])
    .index("by_kind", ["kind"]),

  // ---------------------------------------------------------------------------
  // Recruitment
  // ---------------------------------------------------------------------------

  applications: defineTable({
    name: v.string(),
    email: v.string(),
    location: v.string(),
    school: v.optional(v.string()),
    socials: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          handle: v.string(),
        }),
      ),
    ),
    // Deprecated: replaced by socials. Kept for existing rows.
    socialPlatform: v.optional(v.string()),
    socialHandle: v.optional(v.string()),
    whyXolace: v.string(),
    trackInterest: track,
    image: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("new"),
      v.literal("reviewing"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    reviewNote: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["status"],
    }),
});
