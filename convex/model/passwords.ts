// Strip the uuid separators: it is emailed to a person to type, and a hyphen in
// the middle is easy to misread as a letter or dropped entirely. Still random
// per issue, so it is never valid for another account.
export function generateTemporaryPassword() {
  return `Xolace-${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
}
