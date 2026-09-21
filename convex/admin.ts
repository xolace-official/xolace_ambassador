import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Convex Dashboard Action to manually create a user.
 * 
 * Usage: Execute this Action from the Convex Dashboard to create an Admin or Ambassador.
 */
export const createUser = action({
  args: {
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("ambassador")),
  },
  handler: async (ctx, args) => {
    // 1. Call the authentication provider to generate user and store hash
    try {
      await ctx.runAction((api as any).auth.signIn, {
        provider: "password",
        params: {
          email: args.email,
          password: args.password,
          flow: "signUp"
        }
      });
    } catch (err: any) {
      if (err.message?.includes("User already exists") || err.message?.includes("Record already exists")) {
        console.warn(`User ${args.email} exists, moving to role patch...`);
      } else {
        throw err; // For example: Missing JWT variable
      }
    }

    // 2. Patch the role via internal mutation
    const success = await ctx.runMutation(api.seedRole.assignRole, {
      email: args.email,
      role: args.role,
    });

    if (!success) {
      throw new Error("User creation succeeded but role assignment failed. User may not exist in users table.");
    }

    return `Successfully created/updated ${args.role}: ${args.email}`;
  },
});
