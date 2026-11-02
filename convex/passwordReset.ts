import {
  invalidateSessions,
  modifyAccountCredentials,
} from "@convex-dev/auth/server";
import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import {
  adminPasswordResetEmail,
  loginUrl,
  passwordResetCodeEmail,
} from "./emailTemplates";
import { AuthError, requireAdmin } from "./model/auth";
import { EMAIL_LOGO_URL, sendEmail, trySendEmail } from "./model/email";
import { normalizeEmail } from "./model/emailAddress";
import { CODE_TTL_MINUTES } from "./model/passwordResetEmail";
import { generateTemporaryPassword } from "./model/passwords";

const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Each request emails the address and replaces its code, so unthrottled it spams or blocks.
  passwordResetRequest: {
    kind: "token bucket",
    rate: 3,
    period: HOUR,
    capacity: 3,
  },
  // Caps total emails and made-up-address records; if exhausted, admin reset still works.
  passwordResetGlobal: {
    kind: "token bucket",
    rate: 50,
    period: HOUR,
    capacity: 50,
  },
});

// Consumed for unknown addresses too, so throttling looks the same either way.
export const consumeResetRequest = internalMutation({
  args: { email: v.string() },
  returns: v.union(v.number(), v.null()),
  handler: async (ctx, args) => {
    // Check global first so no record is made past the cap; take from it last so one address can't drain it.
    const global = await rateLimiter.check(ctx, "passwordResetGlobal");
    if (!global.ok) return global.retryAfter;
    const perEmail = await rateLimiter.limit(ctx, "passwordResetRequest", {
      key: normalizeEmail(args.email),
    });
    if (!perEmail.ok) return perEmail.retryAfter;
    // Same transaction as the check above, so this always succeeds.
    await rateLimiter.limit(ctx, "passwordResetGlobal");
    return null;
  },
});

export const sendResetCode = internalAction({
  args: { email: v.string(), code: v.string() },
  returns: v.null(),
  handler: async (_ctx, args) => {
    await sendEmail(
      args.email,
      passwordResetCodeEmail({
        code: args.code,
        expiresInMinutes: CODE_TTL_MINUTES,
        logoUrl: EMAIL_LOGO_URL,
      }),
    );
    return null;
  },
});

export const adminResetTarget = internalQuery({
  args: { ambassadorId: v.id("users") },
  returns: v.object({
    userId: v.id("users"),
    accountId: v.id("authAccounts"),
    name: v.string(),
    accountEmail: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.ambassadorId);
    if (user === null || user.role !== "ambassador") {
      throw new AuthError(404, "Ambassador not found.");
    }
    // The account id, not `users.email`, is the address the password is bound to.
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", user._id).eq("provider", "password"),
      )
      .unique();
    if (account === null) {
      throw new Error("This ambassador has no password sign-in to reset.");
    }
    return {
      userId: user._id,
      accountId: account._id,
      name: user.name ?? "there",
      accountEmail: account.providerAccountId,
    };
  },
});

export const finishAdminReset = internalMutation({
  args: { userId: v.id("users"), accountId: v.id("authAccounts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { passwordSetupRequired: true });
    // A code already sent may be in a compromised inbox.
    const code = await ctx.db
      .query("authVerificationCodes")
      .withIndex("accountId", (q) => q.eq("accountId", args.accountId))
      .unique();
    if (code !== null) await ctx.db.delete(code._id);
    // Only a successful sign-in clears the lockout, which would reject the temporary password.
    const lockout = await ctx.db
      .query("authRateLimits")
      .withIndex("identifier", (q) => q.eq("identifier", args.accountId))
      .unique();
    if (lockout !== null) await ctx.db.delete(lockout._id);
    return null;
  },
});

// Returned to the admin for inbox-less recovery; safe since its first use forces a new password.
export const adminResetPassword = action({
  args: { ambassadorId: v.id("users") },
  returns: v.object({
    temporaryPassword: v.string(),
    emailed: v.boolean(),
    sentTo: v.string(),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    temporaryPassword: string;
    emailed: boolean;
    sentTo: string;
  }> => {
    const target = await ctx.runQuery(internal.passwordReset.adminResetTarget, {
      ambassadorId: args.ambassadorId,
    });

    const temporaryPassword = generateTemporaryPassword();
    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: target.accountEmail, secret: temporaryPassword },
    });
    await invalidateSessions(ctx, { userId: target.userId });
    await ctx.runMutation(internal.passwordReset.finishAdminReset, {
      userId: target.userId,
      accountId: target.accountId,
    });

    const emailed = await trySendEmail(
      target.accountEmail,
      adminPasswordResetEmail({
        name: target.name,
        email: target.accountEmail,
        temporaryPassword,
        loginUrl: loginUrl(),
        logoUrl: EMAIL_LOGO_URL,
      }),
    );
    return { temporaryPassword, emailed, sentTo: target.accountEmail };
  },
});
