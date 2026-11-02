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
  // from a scheduled action rather than inline keeps the Resend round-trip
  // (hundreds of ms) out of the response, which would otherwise plainly mark
  // which addresses have accounts. A small difference remains: a known email
  // also writes the verification code and schedules this job, an unknown one
  // does neither. That is a few ms of server work against normal network
  // jitter, and the per-email rate limit caps how often it can be sampled, so
  // it is accepted rather than padded out.
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
