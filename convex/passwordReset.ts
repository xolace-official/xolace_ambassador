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
  // Each request emails the address and replaces any code already sent to it,
  // so an unthrottled form could be used to spam someone or keep their real
  // code from ever working.
  passwordResetRequest: {
    kind: "token bucket",
    rate: 3,
    period: HOUR,
    capacity: 3,
  },
  // Across all addresses. Bounds the reset emails sent in total, and the
  // per-email records anonymous callers can create with made-up addresses.
  // Someone could exhaust it and block self-service resets for up to an hour;
  // admin reset still works then.
  passwordResetGlobal: {
    kind: "token bucket",
    rate: 50,
    period: HOUR,
    capacity: 50,
  },
});

// Consumed for unknown addresses too, so a throttled request looks the same
// whether or not the account exists. Returns null when allowed, otherwise how
// long until the next request would be.
export const consumeResetRequest = internalMutation({
  args: { email: v.string() },
  returns: v.union(v.number(), v.null()),
  handler: async (ctx, args) => {
    // Check the global bucket before the per-email one, so a new address can't
    // create its record once the global cap is hit. Only take from the global
    // bucket after the per-email check passes, so one address hammered past
    // its own limit can't drain everyone else's budget.
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
    // The account id is the email the password is bound to. Read it from the
    // account itself rather than `users.email`, so a later profile edit can
    // never point the reset at the wrong credentials.
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

// Everything an admin reset must undo besides the password itself.
export const finishAdminReset = internalMutation({
  args: { userId: v.id("users"), accountId: v.id("authAccounts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { passwordSetupRequired: true });
    // A self-service code sent before the reset would otherwise stay valid for
    // its full lifetime. That matters when the inbox is the thing that was
    // compromised.
    const code = await ctx.db
      .query("authVerificationCodes")
      .withIndex("accountId", (q) => q.eq("accountId", args.accountId))
      .unique();
    if (code !== null) await ctx.db.delete(code._id);
    // Convex Auth counts failed password sign-ins per account id and clears
    // the count only on a successful sign-in. Without this, an ambassador who
    // locked themselves out would see the temporary password rejected too.
    const lockout = await ctx.db
      .query("authRateLimits")
      .withIndex("identifier", (q) => q.eq("identifier", args.accountId))
      .unique();
    if (lockout !== null) await ctx.db.delete(lockout._id);
    return null;
  },
});

// Recovery for an ambassador who cannot use the self-service reset (e.g. they
// lost access to their inbox, or the code email never arrives) and whom an
// admin has verified another way. Issues a temporary password and routes their
// next sign-in through /setup-password, exactly like a fresh invitation.
//
// The temporary password is returned to the admin, who passes it on through a
// channel that doesn't depend on the inbox; the email is only a convenience
// for the case where the inbox still works. The admin learning it is
// acceptable: it is single-use in practice, because signing in with it forces
// a new password before the portal opens.
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
    // The account's address, which can differ from `users.email`. Shown to the
    // admin so they know where the email actually went.
    return { temporaryPassword, emailed, sentTo: target.accountEmail };
  },
});
