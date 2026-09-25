import type { Doc, Id, TableNames } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { auth } from "../auth";

export type Role = "admin" | "ambassador";

type Ctx = QueryCtx | MutationCtx;

export class AuthError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export async function requireIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();

  if (identity === null) {
    throw new AuthError(401, "Unauthenticated: sign in to continue.");
  }

  return identity;
}

// The "who am I" probe must NOT throw: the client calls it on every page
// including while signed out, and a thrown query crashes the render.
export async function getSessionUser(ctx: Ctx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();

  if (identity === null) {
    return null;
  }

  const userId = await auth.getUserId(ctx);

  if (userId === null) {
    return null;
  }

  return await ctx.db.get(userId);
}

export async function requireUser(ctx: Ctx): Promise<Doc<"users">> {
  await requireIdentity(ctx);

  const user = await getSessionUser(ctx);

  if (user === null) {
    throw new AuthError(
      401,
      "Unauthenticated: no user record for this session.",
    );
  }

  return user;
}

export async function requireRole(ctx: Ctx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);

  if (user.role !== "admin" && user.role !== "ambassador") {
    throw new AuthError(
      403,
      "Forbidden: your account has not been granted access to the portal yet.",
    );
  }

  return user;
}

export async function requireAdmin(ctx: Ctx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);

  if (user.role !== "admin") {
    throw new AuthError(403, "Forbidden: this area is restricted to admins.");
  }

  return user;
}

// 404 rather than 403 on a failed ownership check, so the error cannot be used
// to discover which ids exist.
export async function requireOwned<T extends TableNames>(
  ctx: Ctx,
  id: Id<T>,
  ownerField: string,
): Promise<Doc<T>> {
  const caller = await requireUser(ctx);
  const row = await ctx.db.get(id);

  if (row === null) {
    throw new AuthError(404, "Not found.");
  }

  const owner = (row as Record<string, unknown>)[ownerField];

  if (owner !== caller._id) {
    throw new AuthError(404, "Not found.");
  }

  return row;
}
