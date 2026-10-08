import {
  invalidateSessions,
  modifyAccountCredentials,
} from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  type MutationCtx,
  mutation,
  query,
} from "./_generated/server";
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

    const image = user.avatarStorageId
      ? await ctx.storage.getUrl(user.avatarStorageId)
      : (user.image ?? null);
    const profile =
      user.role === "ambassador"
        ? await ctx.db
            .query("ambassadorProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first()
        : null;

    return {
      _id: user._id,
      uuid: user.uuid ?? null,
      role: user.role ?? null,
      name: user.name ?? null,
      image,
      email: user.email ?? null,
      referralCode: profile?.referralCode ?? null,
      passwordSetupRequired: user.passwordSetupRequired ?? false,
      programStatus: profile?.status ?? null,
      programStatusReason: profile?.statusReason ?? null,
    };
  },
});

// Scoped to `uuid` only. Role assignment is internal and unreachable from a
// client, so there is no path by which a user can grant themselves a role.
export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const uuid = user.uuid ?? crypto.randomUUID();
    if (user.uuid === undefined) {
      await ctx.db.patch(user._id, { uuid });
    }

    if (user.role === "ambassador") {
      const profile = await ctx.db
        .query("ambassadorProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();
      const referralCode =
        profile?.referralCode ?? (await createReferralCode(ctx));

      if (profile === null) {
        await ctx.db.insert("ambassadorProfiles", {
          userId: user._id,
          referralCode,
          status: "active",
        });
      } else if (profile.referralCode === undefined) {
        await ctx.db.patch(profile._id, { referralCode });
      }
    }

    return uuid;
  },
});

async function createReferralCode(ctx: MutationCtx) {
  for (;;) {
    const referralCode = `AMB-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
    const existing = await ctx.db
      .query("ambassadorProfiles")
      .withIndex("by_referralCode", (q) => q.eq("referralCode", referralCode))
      .first();
    if (existing === null) return referralCode;
  }
}

export const passwordSetupUser = internalQuery({
  args: {},
  returns: v.union(
    v.object({ userId: v.id("users"), email: v.string() }),
    v.null(),
  ),
  handler: async (ctx) => {
    const user = await getSessionUser(ctx);
    if (user?.passwordSetupRequired !== true || !user.email) return null;
    return { userId: user._id, email: user.email };
  },
});

export const clearPasswordSetupRequired = internalMutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { passwordSetupRequired: false });
    return null;
  },
});

export const setPassword = action({
  args: { newPassword: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.newPassword.length < 8) {
      throw new Error("Choose a password with at least 8 characters.");
    }

    const user = await ctx.runQuery(internal.users.passwordSetupUser, {});
    if (user === null) {
      throw new Error("Your password is already configured.");
    }

    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: user.email, secret: args.newPassword },
    });
    await invalidateSessions(ctx, { userId: user.userId });
    await ctx.runMutation(internal.users.clearPasswordSetupRequired, {
      userId: user.userId,
    });
    return null;
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
