import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { AuthError, requireAdmin } from "./model/auth";
import { trackValidator } from "./schema";

const applicationStatusValidator = v.union(
  v.literal("new"),
  v.literal("reviewing"),
  v.literal("accepted"),
  v.literal("rejected"),
);

const applicationValidator = v.object({
  _id: v.id("applications"),
  _creationTime: v.number(),
  name: v.string(),
  email: v.string(),
  location: v.string(),
  school: v.optional(v.string()),
  socialPlatform: v.optional(v.string()),
  socialHandle: v.optional(v.string()),
  whyXolace: v.string(),
  trackInterest: trackValidator,
  status: applicationStatusValidator,
  reviewNote: v.optional(v.string()),
  reviewedAt: v.optional(v.number()),
});

function toApplication(application: Doc<"applications">) {
  return {
    _id: application._id,
    _creationTime: application._creationTime,
    name: application.name,
    email: application.email,
    location: application.location,
    school: application.school,
    socialPlatform: application.socialPlatform,
    socialHandle: application.socialHandle,
    whyXolace: application.whyXolace,
    trackInterest: application.trackInterest,
    status: application.status,
    reviewNote: application.reviewNote,
    reviewedAt: application.reviewedAt,
  };
}

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    location: v.string(),
    school: v.optional(v.string()),
    socialPlatform: v.optional(v.string()),
    socialHandle: v.optional(v.string()),
    whyXolace: v.string(),
    trackInterest: trackValidator,
  },
  returns: v.id("applications"),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const location = args.location.trim();
    const school = args.school?.trim();
    const socialPlatform = args.socialPlatform?.trim();
    const socialHandle = args.socialHandle?.trim();
    const whyXolace = args.whyXolace.trim();

    if (name.length < 2 || name.length > 120) {
      throw new Error("Enter a name between 2 and 120 characters.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address.");
    }
    if (location.length < 2 || location.length > 120) {
      throw new Error("Enter a location between 2 and 120 characters.");
    }
    if (school && school.length > 160) {
      throw new Error("Keep the school or community under 160 characters.");
    }
    if (socialPlatform && socialPlatform.length > 80) {
      throw new Error("Choose a valid social platform.");
    }
    if (socialHandle && socialHandle.length > 100) {
      throw new Error("Keep the social handle under 100 characters.");
    }
    if (whyXolace.length < 20 || whyXolace.length > 4000) {
      throw new Error("Write between 20 and 4,000 characters about Xolace.");
    }

    const existing = await ctx.db
      .query("applications")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing !== null) {
      throw new Error("An application with this email is already on file.");
    }

    return await ctx.db.insert("applications", {
      name,
      email,
      location,
      school: school || undefined,
      socialPlatform: socialPlatform || undefined,
      socialHandle: socialHandle || undefined,
      whyXolace,
      trackInterest: args.trackInterest,
      status: "new",
    });
  },
});

export const adminList = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(applicationStatusValidator),
    search: v.optional(v.string()),
  },
  returns: paginationResultValidator(applicationValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const status = args.status;
    const search = args.search?.trim();
    const applications = search
      ? await ctx.db
          .query("applications")
          .withSearchIndex("search_name", (q) => {
            const searchFilter = q.search("name", search);
            return status === undefined
              ? searchFilter
              : searchFilter.eq("status", status);
          })
          .paginate(args.paginationOpts)
      : status === undefined
        ? await ctx.db
            .query("applications")
            .order("desc")
            .paginate(args.paginationOpts)
        : await ctx.db
            .query("applications")
            .withIndex("by_status", (q) => q.eq("status", status))
            .order("desc")
            .paginate(args.paginationOpts);

    return {
      ...applications,
      page: applications.page.map(toApplication),
    };
  },
});

export const adminGet = query({
  args: { applicationId: v.string() },
  returns: v.union(applicationValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const id = ctx.db.normalizeId("applications", args.applicationId);
    if (id === null) return null;
    const application = await ctx.db.get(id);
    return application === null ? null : toApplication(application);
  },
});

export const adminReview = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(
      v.literal("reviewing"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
    reviewNote: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const application = await ctx.db.get(args.applicationId);
    if (application === null) {
      throw new AuthError(404, "Application not found.");
    }
    if (args.reviewNote && args.reviewNote.trim().length > 4000) {
      throw new Error("Keep the review note under 4,000 characters.");
    }

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      reviewNote: args.reviewNote?.trim() || undefined,
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
    });

    return null;
  },
});
