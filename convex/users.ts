import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getSessionUser, requireUser } from "./model/auth";

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    return await getSessionUser(ctx);
  },
});

// The session probe: returns null when signed out rather than throwing, so the
// client can render the login form and the signed-out shell.
export const current = query({
  args: {},
  handler: async (ctx) => {
    const user = await getSessionUser(ctx);

    if (user === null) {
      return null;
    }

    return {
      _id: user._id,
      uuid: user.uuid ?? null,
      role: user.role ?? null,
      name: user.name ?? null,
      image: user.image ?? null,
      email: user.email ?? null,
    };
  },
});

// Scoped to `uuid` only. Role assignment is internal and unreachable from a
// client, so there is no path by which a user can grant themselves a role.
export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    if (user.uuid !== undefined) {
      return user.uuid;
    }

    const uuid = crypto.randomUUID();
    await ctx.db.patch(user._id, { uuid });

    return uuid;
  },
});

// The `uuid` argument can only ever resolve the caller, so this cannot be used
// to enumerate other ambassadors.
export const byUuid = query({
  args: { uuid: v.string() },
  handler: async (ctx, args) => {
    const caller = await requireUser(ctx);

    if (caller.uuid !== args.uuid) {
      throw new Error("Forbidden: you can only read your own profile.");
    }

    return {
      uuid: caller.uuid,
      role: caller.role ?? null,
      name: caller.name ?? null,
      image: caller.image ?? null,
    };
  },
});
