// Password accounts are keyed by email, and the lookup is an exact match. Every
// path that creates or finds an account must normalize the same way, or
// `Jane@example.com` and `jane@example.com` become two different people.
// Kept free of imports so auth.ts can use it without creating a cycle.
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// Thrown when a reset request is throttled. Unknown emails consume the same
// budget, so saying so reveals nothing about whether the account exists.
export const RESET_RATE_LIMITED = "PasswordResetRateLimited";
