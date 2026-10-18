import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// Internal: a public version of this let anyone POST their own email with
// role: "admin" and promote themselves.
export const assignRole = internalMutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("ambassador")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (user === null) {
      return false;
    }

    await ctx.db.patch(user._id, { role: args.role });
    return true;
  },
});
