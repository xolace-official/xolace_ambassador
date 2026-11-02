import {
  ConvexCredentials,
  type ConvexCredentialsUserConfig,
} from "@convex-dev/auth/providers/ConvexCredentials";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { normalizeEmail, RESET_RATE_LIMITED } from "./model/emailAddress";
import { PasswordResetEmail } from "./model/passwordResetEmail";

// Password()'s real `authorize` sits in `options`; wrapping it is the only hook before a reset code is created.
const password = Password<DataModel>({
  reset: PasswordResetEmail,
  // Runs first on every flow, so this alone decides the account id.
  profile: (params) => {
    if (typeof params.email !== "string") {
      throw new Error("Missing email.");
    }
    return { email: normalizeEmail(params.email) };
  },
});
const passwordConfig = (
  password as unknown as { options?: ConvexCredentialsUserConfig<DataModel> }
).options;
if (typeof passwordConfig?.authorize !== "function") {
  // Fail the deploy loudly rather than silently losing the reset guards.
  throw new Error(
    "@convex-dev/auth changed the Password provider's shape; update convex/auth.ts.",
  );
}
const passwordAuthorize = passwordConfig.authorize;

// Thrown for an email with no account; leaking it would reveal who is an ambassador.
const UNKNOWN_ACCOUNT = "InvalidAccountId";

const PasswordWithGuardedReset = ConvexCredentials<DataModel>({
  ...passwordConfig,
  authorize: async (params, ctx) => {
    if (params.flow === "reset") {
      if (typeof params.email !== "string") return null;
      const retryAfterMs = await ctx.runMutation(
        internal.passwordReset.consumeResetRequest,
        { email: params.email },
      );
      if (retryAfterMs !== null) {
        throw new ConvexError({ code: RESET_RATE_LIMITED, retryAfterMs });
      }
      try {
        // Null once the code is issued, the same answer as every early return.
        return await passwordAuthorize(params, ctx);
      } catch (error) {
        if (!(error instanceof Error && error.message === UNKNOWN_ACCOUNT)) {
          console.error("Password reset request failed:", error);
        }
        return null;
      }
    }

    if (params.flow === "reset-verification") {
      let result: Awaited<ReturnType<typeof passwordAuthorize>>;
      try {
        result = await passwordAuthorize(params, ctx);
      } catch (error) {
        // Same message as a wrong code, so an unknown email is indistinguishable.
        if (error instanceof Error && error.message === UNKNOWN_ACCOUNT) {
          throw new Error("Could not verify code");
        }
        throw error;
      }
      // Inbox proof beats the emailed temporary password, so a reset also completes first-time setup.
      if (result !== null) {
        await ctx.runMutation(internal.users.clearPasswordSetupRequired, {
          userId: result.userId,
        });
      }
      return result;
    }

    return await passwordAuthorize(params, ctx);
  },
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [PasswordWithGuardedReset],
});
