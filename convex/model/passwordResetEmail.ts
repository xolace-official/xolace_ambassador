import { Email } from "@convex-dev/auth/providers/Email";
import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";

// Not in passwordReset.ts: that reaches auth.ts, and the cycle leaves this provider undefined.

export const CODE_TTL_MINUTES = 15;

// 8 digits: Convex Auth allows 10 wrong guesses an hour per email, far short of 10^8.
export const PasswordResetEmail = Email({
  id: "password-reset",
  maxAge: CODE_TTL_MINUTES * 60,
  async generateVerificationToken() {
    return Array.from(
      crypto.getRandomValues(new Uint32Array(8)),
      (n) => n % 10,
    ).join("");
  },
  // Scheduled so the Resend round-trip can't time-reveal which emails have accounts.
  async sendVerificationRequest({ identifier, token }, ctx?: ActionCtx) {
    if (ctx === undefined) {
      throw new Error("Password reset email needs the Convex action context.");
    }
    await ctx.scheduler.runAfter(0, internal.passwordReset.sendResetCode, {
      email: identifier,
      code: token,
    });
  },
});
