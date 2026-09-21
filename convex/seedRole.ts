import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const assignRole = mutation({
  args: { email: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    // Find the user by email
    const userRow = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    
    if (userRow) {
      await ctx.db.patch(userRow._id, { role: args.role });
      return true;
    }
    return false;
  },
});
