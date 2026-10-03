import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./model/auth";

const settingsProfileValidator = v.union(
  v.object({
    location: v.union(v.string(), v.null()),
    school: v.union(v.string(), v.null()),
    bio: v.union(v.string(), v.null()),
    tiktok: v.union(v.string(), v.null()),
    instagram: v.union(v.string(), v.null()),
    x: v.union(v.string(), v.null()),
    youtube: v.union(v.string(), v.null()),
    linkedin: v.union(v.string(), v.null()),
    snapchat: v.union(v.string(), v.null()),
  }),
  v.null(),
);

const programProfileValidator = v.union(
  v.object({
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("suspended"),
    ),
    track: v.union(
      v.literal("creator"),
      v.literal("community"),
      v.literal("growth"),
      v.literal("creative"),
      v.literal("production"),
      v.literal("advocacy"),
      v.null(),
    ),
    podName: v.union(v.string(), v.null()),
    safetyAcknowledgedAt: v.union(v.number(), v.null()),
  }),
  v.null(),
);

export const getSettings = query({
  args: {},
  returns: v.object({
    role: v.union(v.literal("admin"), v.literal("ambassador")),
    name: v.union(v.string(), v.null()),
    email: v.union(v.string(), v.null()),
    image: v.union(v.string(), v.null()),
    profile: settingsProfileValidator,
    program: programProfileValidator,
  }),
  handler: async (ctx) => {
    const user = await requireRole(ctx);
    const role: "admin" | "ambassador" =
      user.role === "admin" ? "admin" : "ambassador";
    const profile =
      role === "ambassador"
        ? await ctx.db
            .query("ambassadorProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first()
        : null;
    const pod = profile?.podId ? await ctx.db.get(profile.podId) : null;
    const storedImage = user.avatarStorageId
      ? await ctx.storage.getUrl(user.avatarStorageId)
      : null;

    return {
      role,
      name: user.name?.trim() || null,
      email: user.email?.trim() || null,
      image: storedImage ?? user.image ?? null,
      profile: profile
        ? {
            location: profile.location ?? null,
            school: profile.school ?? null,
            bio: profile.bio ?? null,
            tiktok: profile.socials?.tiktok ?? null,
            instagram: profile.socials?.instagram ?? null,
            x: profile.socials?.x ?? null,
            youtube: profile.socials?.youtube ?? null,
            linkedin: profile.socials?.linkedin ?? null,
            snapchat: profile.socials?.snapchat ?? null,
          }
        : null,
      program: profile
        ? {
            status: profile.status,
            track: profile.track ?? null,
            podName: pod?.name ?? null,
            safetyAcknowledgedAt: profile.safetyAcknowledgedAt ?? null,
          }
        : null,
    };
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireRole(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveAvatar = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireRole(ctx);
    const metadata = await ctx.storage.getMetadata(args.storageId);

    if (
      metadata === null ||
      !metadata.contentType?.startsWith("image/") ||
      metadata.size > 5 * 1024 * 1024
    ) {
      throw new Error("Choose an image smaller than 5 MB.");
    }

    await ctx.db.patch(user._id, { avatarStorageId: args.storageId });
    return null;
  },
});

export const acknowledgeSafety = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await requireRole(ctx);

    if (user.role !== "ambassador") {
      throw new Error("Only ambassadors can complete this acknowledgement.");
    }

    const profile = await ctx.db
      .query("ambassadorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (profile === null) {
      throw new Error("Your ambassador profile is not ready yet.");
    }

    if (profile.safetyAcknowledgedAt === undefined) {
      await ctx.db.patch(profile._id, { safetyAcknowledgedAt: Date.now() });
    }

    return null;
  },
});

export const updateSettings = mutation({
  args: {
    name: v.string(),
    location: v.optional(v.string()),
    school: v.optional(v.string()),
    bio: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    instagram: v.optional(v.string()),
    x: v.optional(v.string()),
    youtube: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    snapchat: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireRole(ctx);
    const name = args.name.trim();

    if (name.length < 2) {
      throw new Error("Enter a name with at least 2 characters.");
    }

    await ctx.db.patch(user._id, { name });

    if (user.role !== "ambassador") {
      return null;
    }

    const profile = await ctx.db
      .query("ambassadorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    const socials = {
      tiktok: args.tiktok?.trim() ?? "",
      instagram: args.instagram?.trim() ?? "",
      x: args.x?.trim() ?? "",
      youtube: args.youtube?.trim() ?? "",
      linkedin: args.linkedin?.trim() ?? "",
      snapchat: args.snapchat?.trim() ?? "",
    };
    const profileFields = {
      location: args.location?.trim() ?? "",
      school: args.school?.trim() ?? "",
      bio: args.bio?.trim() ?? "",
      socials,
    };

    if (profile) {
      await ctx.db.patch(profile._id, profileFields);
    } else {
      await ctx.db.insert("ambassadorProfiles", {
        userId: user._id,
        status: "active",
        ...profileFields,
      });
    }

    return null;
  },
});
