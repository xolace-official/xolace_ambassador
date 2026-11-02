import {
  ConvexCredentials,
  type ConvexCredentialsUserConfig,
} from "@convex-dev/auth/providers/ConvexCredentials";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { PasswordResetEmail } from "./model/passwordResetEmail";

// Password() returns a shell whose real config — `authorize` included — sits
// in `options` and is merged over the shell when Convex Auth loads providers.
// Wrapping that `authorize` is the only hook that runs before a reset code is
// created, which is where the throttle and the enumeration guard have to live.
const password = Password<DataModel>({ reset: PasswordResetEmail });
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

// The library throws this for an email with no account. It must never reach
// the client, or the reset form becomes a way to check who is an ambassador.
const UNKNOWN_ACCOUNT = "InvalidAccountId";

const PasswordWithGuardedReset = ConvexCredentials<DataModel>({
  ...passwordConfig,
  authorize: async (params, ctx) => {
    if (params.flow === "reset") {
      if (typeof params.email !== "string") return null;
      const allowed = await ctx.runMutation(
        internal.passwordReset.consumeResetRequest,
        { email: params.email },
      );
      if (!allowed) return null;
      try {
        // Returns null once the code is issued — the same answer as every
        // early return above.
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
      // Proving control of the inbox is at least as strong as the emailed
      // temporary password, so a reset also completes first-time setup.
      // Otherwise an invited ambassador who resets would be sent straight to
      // /setup-password to pick a password a second time.
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
