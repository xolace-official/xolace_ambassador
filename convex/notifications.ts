import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  internalMutation,
  type MutationCtx,
  mutation,
  query,
} from "./_generated/server";
import { AuthError, requireRole, requireUser } from "./model/auth";

const notificationKind = v.union(
  v.literal("mission"),
  v.literal("review"),
  v.literal("reward"),
  v.literal("resource"),
  v.literal("community"),
);

const notificationValidator = v.object({
  _id: v.id("notifications"),
  _creationTime: v.number(),
  kind: notificationKind,
  title: v.string(),
  description: v.string(),
  href: v.string(),
  readAt: v.union(v.number(), v.null()),
});

export const list = query({
  args: {},
  returns: v.array(notificationValidator),
  handler: async (ctx) => {
    const user = await requireRole(ctx);
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_recipientId", (q) => q.eq("recipientId", user._id))
      .order("desc")
      .take(50);

    return rows.map((row) => ({
      _id: row._id,
      _creationTime: row._creationTime,
      kind: row.kind,
      title: row.title,
      description: row.description,
      href: row.href,
      readAt: row.readAt ?? null,
    }));
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const notification = await ctx.db.get(args.notificationId);
    if (notification === null || notification.recipientId !== user._id) {
      throw new AuthError(404, "Not found.");
    }
    if (notification.readAt === undefined) {
      await ctx.db.patch(args.notificationId, { readAt: Date.now() });
    }
    return null;
  },
});

export const createForUser = internalMutation({
  args: {
    recipientId: v.id("users"),
    kind: notificationKind,
    title: v.string(),
    description: v.string(),
    href: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const recipient = await ctx.db.get(args.recipientId);
    if (
      recipient?.notificationPreferences &&
      !recipient.notificationPreferences[args.kind]
    ) {
      return null;
    }
    await insertNotification(ctx, args);
    return null;
  },
});

export const createForAmbassadors = internalMutation({
  args: {
    kind: notificationKind,
    title: v.string(),
    description: v.string(),
    href: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ambassadors = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "ambassador"))
      .take(500);

    for (const ambassador of ambassadors) {
      if (
        ambassador.notificationPreferences &&
        !ambassador.notificationPreferences[args.kind]
      ) {
        continue;
      }
      await insertNotification(ctx, {
        recipientId: ambassador._id,
        ...args,
        href: `/ambassador/${ambassador._id}${args.href}`,
      });
    }
    return null;
  },
});

async function insertNotification(
  ctx: MutationCtx,
  args: {
    recipientId: Id<"users">;
    kind: "mission" | "review" | "reward" | "resource" | "community";
    title: string;
    description: string;
    href: string;
  },
) {
  await ctx.db.insert("notifications", {
    recipientId: args.recipientId,
    kind: args.kind,
    title: args.title,
    description: args.description,
    href: args.href,
  });
}
