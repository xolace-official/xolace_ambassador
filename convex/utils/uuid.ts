export function generateUuid(): string {
  // Uses the Web Crypto API to generate a RFC4122 version 4 UUID
  return crypto.randomUUID();
}
