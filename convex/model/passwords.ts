// No uuid hyphens: a person types this, and a mid-string hyphen is easy to drop.
export function generateTemporaryPassword() {
  return `Xolace-${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
}
