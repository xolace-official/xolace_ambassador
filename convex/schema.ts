import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
  users: defineTable(
    authTables.users.validator.extend({
      uuid: v.optional(v.string()),
      role: v.optional(v.union(v.literal("admin"), v.literal("ambassador"))),
    }),
  )
    .index("uuid", ["uuid"])
    .index("email", ["email"])
    .index("phone", ["phone"]),
});
