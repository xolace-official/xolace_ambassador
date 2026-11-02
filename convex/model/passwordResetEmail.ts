import { Email } from "@convex-dev/auth/providers/Email";
import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";

// Kept apart from convex/passwordReset.ts on purpose: auth.ts imports this, and
// anything that reaches model/auth.ts (which imports auth.ts) would be a cycle
// that leaves this provider undefined when Password() is configured.

export const CODE_TTL_MINUTES = 15;

// The `reset` provider for Password. Codes are 8 digits: a failed guess counts
// against Convex Auth's per-email limit (10 an hour), which keeps 10^8 out of
// reach within the code's lifetime.
export const PasswordResetEmail = Email({
  id: "password-reset",
  maxAge: CODE_TTL_MINUTES * 60,
  async generateVerificationToken() {
    return Array.from(
      crypto.getRandomValues(new Uint32Array(8)),
      (n) => n % 10,
    ).join("");
  },
  // Convex Auth passes the action ctx as an untyped second argument. Sending
  // from a scheduled action rather than inline keeps the response time the
  // same for unknown emails (which send nothing), so the timing cannot be used
  // to discover which addresses have accounts.
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
