import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { normalizeEmail } from "./model/emailAddress";

// Internal: a public version of this let anyone POST their own email with
// role: "admin" and promote themselves.
export const assignRole = internalMutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("ambassador")),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      // Sign-up stores the email normalized (see auth.ts `profile`).
      .withIndex("email", (q) => q.eq("email", normalizeEmail(args.email)))
      .first();

    if (user === null) {
      return false;
    }

    await ctx.db.patch(user._id, { role: args.role });
    return true;
  },
});
