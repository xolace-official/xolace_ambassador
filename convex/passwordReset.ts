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
});

// Consumed for unknown addresses too, so a throttled request looks the same
// whether or not the account exists.
export const consumeResetRequest = internalMutation({
  args: { email: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const { ok } = await rateLimiter.limit(ctx, "passwordResetRequest", {
      key: args.email.trim().toLowerCase(),
    });
    return ok;
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
      name: user.name ?? "there",
      accountEmail: account.providerAccountId,
    };
  },
});

export const markPasswordSetupRequired = internalMutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { passwordSetupRequired: true });
    return null;
  },
});

// Recovery for an ambassador who cannot use the self-service reset (e.g. they
// lost access to their inbox and an admin has verified them another way).
// Issues a temporary password and routes their next sign-in through
// /setup-password, exactly like a fresh invitation.
export const adminResetPassword = action({
  args: { ambassadorId: v.id("users") },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const target = await ctx.runQuery(internal.passwordReset.adminResetTarget, {
      ambassadorId: args.ambassadorId,
    });

    const temporaryPassword = generateTemporaryPassword();
    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: target.accountEmail, secret: temporaryPassword },
    });
    await invalidateSessions(ctx, { userId: target.userId });
    await ctx.runMutation(internal.passwordReset.markPasswordSetupRequired, {
      userId: target.userId,
    });

    return await trySendEmail(
      target.accountEmail,
      adminPasswordResetEmail({
        name: target.name,
        email: target.accountEmail,
        temporaryPassword,
        loginUrl: loginUrl(),
        logoUrl: EMAIL_LOGO_URL,
      }),
    );
  },
});
