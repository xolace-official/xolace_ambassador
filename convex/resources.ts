import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { requireAdmin, requireRole } from "./model/auth";

export const categoryValidator = v.union(
  v.literal("playbook"),
  v.literal("videos"),
  v.literal("brand_kit"),
  v.literal("templates"),
  v.literal("campaign_assets"),
  v.literal("screenshots"),
  v.literal("guide"),
  v.literal("captions"),
);

export const kindValidator = v.union(
  v.literal("link"),
  v.literal("file"),
  v.literal("content"),
  v.literal("video"),
);

export const trackValidator = v.union(
  v.literal("creator"),
  v.literal("community"),
  v.literal("growth"),
  v.literal("creative"),
  v.literal("production"),
  v.literal("advocacy"),
);

export const assetMetadataValidator = v.object({
  estimatedReadTime: v.optional(v.string()),
  fileType: v.optional(v.string()),
  fileSize: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
});

const resourceValidator = v.object({
  _id: v.id("resources"),
  _creationTime: v.number(),
  title: v.string(),
  description: v.string(),
  category: categoryValidator,
  kind: kindValidator,
  url: v.optional(v.string()),
  embedUrl: v.optional(v.string()),
  content: v.optional(v.string()),
  storageId: v.optional(v.id("_storage")),
  assetMetadata: v.optional(assetMetadataValidator),
  track: v.optional(trackValidator),
  published: v.boolean(),
  sortOrder: v.number(),
});

export const listPublished = query({
  args: {},
  returns: v.array(resourceValidator),
  handler: async (ctx) => {
    await requireRole(ctx);
    return await ctx.db
      .query("resources")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();
  },
});

export const listAll = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(resourceValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("resources")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { resourceId: v.string() },
  returns: v.union(resourceValidator, v.null()),
  handler: async (ctx, args) => {
    await requireRole(ctx);
    const id = ctx.db.normalizeId("resources", args.resourceId);
    if (id === null) return null;
    return await ctx.db.get(id);
  },
});

export const getDownloadUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    await requireRole(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = internalMutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    kind: kindValidator,
    url: v.optional(v.string()),
    embedUrl: v.optional(v.string()),
    content: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    assetMetadata: v.optional(assetMetadataValidator),
    track: v.optional(trackValidator),
    published: v.boolean(),
    sortOrder: v.number(),
  },
  returns: v.id("resources"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("resources", {
      title: args.title.trim(),
      description: args.description.trim(),
      category: args.category,
      kind: args.kind,
      url: args.url?.trim() || undefined,
      embedUrl: args.embedUrl?.trim() || undefined,
      content: args.content?.trim() || undefined,
      storageId: args.storageId,
      assetMetadata: args.assetMetadata,
      track: args.track,
      published: args.published,
      sortOrder: args.sortOrder,
    });
  },
});

export const update = internalMutation({
  args: {
    resourceId: v.id("resources"),
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    kind: kindValidator,
    url: v.optional(v.string()),
    embedUrl: v.optional(v.string()),
    content: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    assetMetadata: v.optional(assetMetadataValidator),
    track: v.optional(trackValidator),
    published: v.boolean(),
    sortOrder: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.resourceId);
    if (existing === null) {
      throw new Error("Resource not found.");
    }
    await ctx.db.patch(args.resourceId, {
      title: args.title.trim(),
      description: args.description.trim(),
      category: args.category,
      kind: args.kind,
      url: args.url?.trim() || undefined,
      embedUrl: args.embedUrl?.trim() || undefined,
      content: args.content?.trim() || undefined,
      storageId: args.storageId ?? existing.storageId,
      assetMetadata: args.assetMetadata,
      track: args.track,
      published: args.published,
      sortOrder: args.sortOrder,
    });
    return null;
  },
});

export const remove = internalMutation({
  args: { resourceId: v.id("resources") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.resourceId);
    if (existing === null) {
      throw new Error("Resource not found.");
    }
    if (existing.storageId) {
      await ctx.storage.delete(existing.storageId);
    }
    await ctx.db.delete(args.resourceId);
    return null;
  },
});

export const togglePublished = internalMutation({
  args: { resourceId: v.id("resources") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.resourceId);
    if (existing === null) {
      throw new Error("Resource not found.");
    }
    await ctx.db.patch(args.resourceId, { published: !existing.published });
    return !existing.published;
  },
});

export const adminCreate = action({
  args: {
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    kind: kindValidator,
    url: v.optional(v.string()),
    embedUrl: v.optional(v.string()),
    content: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    assetMetadata: v.optional(assetMetadataValidator),
    track: v.optional(trackValidator),
    published: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args): Promise<string> => {
    return await ctx.runMutation(internal.resources.create, args);
  },
});

export const adminUpdate = action({
  args: {
    resourceId: v.id("resources"),
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    kind: kindValidator,
    url: v.optional(v.string()),
    embedUrl: v.optional(v.string()),
    content: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    assetMetadata: v.optional(assetMetadataValidator),
    track: v.optional(trackValidator),
    published: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args): Promise<null> => {
    return await ctx.runMutation(internal.resources.update, args);
  },
});

export const adminDelete = action({
  args: { resourceId: v.id("resources") },
  handler: async (ctx, args): Promise<null> => {
    return await ctx.runMutation(internal.resources.remove, args);
  },
});

export const adminTogglePublished = action({
  args: { resourceId: v.id("resources") },
  handler: async (ctx, args): Promise<boolean> => {
    return await ctx.runMutation(internal.resources.togglePublished, args);
  },
});
