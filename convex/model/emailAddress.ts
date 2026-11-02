// Account lookup is an exact match, so every path must normalize alike. No imports: auth.ts uses it.
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// Unknown emails share the budget, so reporting a throttle reveals nothing about the account.
export const RESET_RATE_LIMITED = "PasswordResetRateLimited";
