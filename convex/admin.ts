import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

// Internal: this signs up an account *and* grants it a role. Run it from the
// Convex dashboard — `admin:createUser`.
export const createUser = internalAction({
  args: {
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("ambassador")),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.runAction(api.auth.signIn, {
        provider: "password",
        params: {
          email: args.email,
          password: args.password,
          flow: "signUp",
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      if (
        !message.includes("User already exists") &&
        !message.includes("Record already exists")
      ) {
        throw err; // e.g. missing JWT variable
      }

      console.warn(`User ${args.email} already exists, assigning role only...`);
    }

    const success = await ctx.runMutation(internal.provisioning.assignRole, {
      email: args.email,
      role: args.role,
    });

    if (!success) {
      throw new Error(
        "User creation succeeded but role assignment failed. User may not exist in users table.",
      );
    }

    return `Successfully created/updated ${args.role}: ${args.email}`;
  },
});
