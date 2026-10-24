import {
  invalidateSessions,
  modifyAccountCredentials,
} from "@convex-dev/auth/server";
import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  type ActionCtx,
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import {
  acceptedApplicationEmail,
  applicationReceivedEmail,
  baseUrl,
  declinedApplicationEmail,
  loginUrl,
  meetingScheduledEmail,
  meetingSlotSelectionEmail,
} from "./emailTemplates";
import {
  DEFAULT_MEETING_SLOTS,
  formatMeetingSlot,
  MIN_MEETING_LEAD_TIME_MS,
} from "./meetingSlots";
import { AuthError, requireAdmin } from "./model/auth";
import { isMeetingSlotBooked } from "./model/meetingSlots";
import { trackValidator } from "./schema";

const applicationStatusValidator = v.union(
  v.literal("new"),
  v.literal("reviewing"),
  v.literal("accepted"),
  v.literal("rejected"),
);

const meetingSlotIdValidator = v.string();

const EMAIL_LOGO_URL =
  "https://res.cloudinary.com/dnucdwa71/image/upload/v1780657998/main-logo_ip0ag6.png";

const socialValidator = v.object({
  platform: v.string(),
  handle: v.string(),
});

const applicationValidator = v.object({
  _id: v.id("applications"),
  _creationTime: v.number(),
  name: v.string(),
  email: v.string(),
  dateOfBirth: v.optional(v.string()),
  location: v.string(),
  school: v.optional(v.string()),
  socials: v.optional(v.array(socialValidator)),
  whyXolace: v.string(),
  trackInterest: trackValidator,
  referralCode: v.union(v.string(), v.null()),
  meetingSlotId: v.union(v.string(), v.null()),
  meetingSlotLabel: v.union(v.string(), v.null()),
  meetingSlotStartsAt: v.union(v.number(), v.null()),
  meetingSlotSelectionSentAt: v.union(v.number(), v.null()),
  meetingSlotSelectionCompletedAt: v.union(v.number(), v.null()),
  image: v.optional(v.id("_storage")),
  status: applicationStatusValidator,
  reviewNote: v.optional(v.string()),
  reviewedAt: v.optional(v.number()),
  ambassadorId: v.union(v.id("users"), v.null()),
  invitationSentAt: v.union(v.number(), v.null()),
  meetingScheduledAt: v.union(v.number(), v.null()),
});

function toApplication(application: Doc<"applications">) {
  return {
    _id: application._id,
    _creationTime: application._creationTime,
    name: application.name,
    email: application.email,
    dateOfBirth: application.dateOfBirth,
    location: application.location,
    school: application.school,
    socials: application.socials,
    whyXolace: application.whyXolace,
    trackInterest: application.trackInterest,
    referralCode: application.referralCode ?? null,
    meetingSlotId: application.meetingSlotId ?? null,
    meetingSlotLabel: application.meetingSlotLabel ?? null,
    meetingSlotStartsAt: application.meetingSlotStartsAt ?? null,
    meetingSlotSelectionSentAt: application.meetingSlotSelectionSentAt ?? null,
    meetingSlotSelectionCompletedAt:
      application.meetingSlotSelectionCompletedAt ?? null,
    image: application.image,
    status: application.status,
    reviewNote: application.reviewNote,
    reviewedAt: application.reviewedAt,
    ambassadorId: application.ambassadorId ?? null,
    invitationSentAt: application.invitationSentAt ?? null,
    meetingScheduledAt: application.meetingScheduledAt ?? null,
  };
}

export const generateUploadUrl = internalMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Slots that are in the future, active, and not already booked. Shared by the
// public form query and the submit validation so the two can never disagree.
// The defaults apply only while no slots have been configured at all; once the
// table has rows, disabled or past slots must not bring the defaults back.
async function availableMeetingSlots(
  ctx: Parameters<typeof requireAdmin>[0],
  now: number,
  excludedApplicationId?: Id<"applications">,
) {
  const isConfigured = (await ctx.db.query("meetingSlots").first()) !== null;
  const slots = isConfigured
    ? (
        await ctx.db
          .query("meetingSlots")
          .withIndex("by_active_and_startsAt", (q) =>
            q
              .eq("active", true)
              .gte("startsAt", now + MIN_MEETING_LEAD_TIME_MS),
          )
          .order("asc")
          .take(100)
      ).map((slot) => ({ id: slot.slotKey, startsAt: slot.startsAt }))
    : DEFAULT_MEETING_SLOTS.filter(
        (slot) => slot.startsAt >= now + MIN_MEETING_LEAD_TIME_MS,
      );
  const available = await Promise.all(
    slots.map(async (slot) =>
      (await isMeetingSlotBooked(ctx, slot.id, excludedApplicationId))
        ? null
        : slot,
    ),
  );
  return available.filter(
    (slot): slot is { id: string; startsAt: number } => slot !== null,
  );
}

export const listMeetingSlots = query({
  args: { now: v.number() },
  returns: v.array(
    v.object({
      id: v.string(),
      startsAt: v.number(),
      label: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const available = await availableMeetingSlots(ctx, args.now);
    return available.map((slot) => ({
      ...slot,
      label: formatMeetingSlot(slot.startsAt),
    }));
  },
});

export const requestUploadUrl = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    return await ctx.runMutation(internal.applications.generateUploadUrl);
  },
});

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    dateOfBirth: v.string(),
    location: v.string(),
    school: v.optional(v.string()),
    socials: v.array(socialValidator),
    whyXolace: v.string(),
    trackInterest: trackValidator,
    referralCode: v.optional(v.string()),
    meetingSlotId: meetingSlotIdValidator,
    image: v.id("_storage"),
  },
  returns: v.id("applications"),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const dateOfBirth = args.dateOfBirth.trim();
    const location = args.location.trim();
    const school = args.school?.trim();
    const socials = args.socials.map((s) => ({
      platform: s.platform.trim(),
      handle: s.handle.trim(),
    }));
    const whyXolace = args.whyXolace.trim();
    const referralCode = args.referralCode?.trim().toUpperCase() || undefined;
    const now = Date.now();

    const available = await availableMeetingSlots(ctx, now);
    const selectedSlot = available.find(
      (slot) => slot.id === args.meetingSlotId,
    );
    if (selectedSlot === undefined) {
      throw new Error(
        (await isMeetingSlotBooked(ctx, args.meetingSlotId))
          ? "That meeting time has already been taken. Choose another time."
          : available.length === 0
            ? "No meeting times are available right now. Please check back later."
            : "Choose one of the available meeting times.",
      );
    }

    if (name.length < 2 || name.length > 120) {
      throw new Error("Enter a name between 2 and 120 characters.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address.");
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
      new Date(`${dateOfBirth}T00:00:00Z`) > new Date()
    ) {
      throw new Error("Choose a valid date of birth.");
    }
    if (location.length < 2 || location.length > 120) {
      throw new Error("Enter a location between 2 and 120 characters.");
    }
    if (school && school.length > 160) {
      throw new Error("Keep the school or community under 160 characters.");
    }
    if (socials.length === 0) {
      throw new Error("Add at least one social profile.");
    }
    for (const social of socials) {
      if (!social.platform || social.platform.length > 80) {
        throw new Error("Choose a valid social platform.");
      }
      if (!social.handle || social.handle.length > 200) {
        throw new Error("Keep each social handle under 200 characters.");
      }
    }
    if (whyXolace.length < 20 || whyXolace.length > 4000) {
      throw new Error("Write between 20 and 4,000 characters about Xolace.");
    }

    if (referralCode !== undefined) {
      const referringProfile = await ctx.db
        .query("ambassadorProfiles")
        .withIndex("by_referralCode", (q) => q.eq("referralCode", referralCode))
        .first();
      if (referringProfile === null) {
        throw new Error("Enter a valid ambassador referral code.");
      }
    }

    const existing = await ctx.db
      .query("applications")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing !== null) {
      throw new Error("An application with this email is already on file.");
    }

    const applicationId = await ctx.db.insert("applications", {
      name,
      email,
      dateOfBirth,
      location,
      school: school || undefined,
      socials,
      whyXolace,
      trackInterest: args.trackInterest,
      referralCode,
      meetingSlotId: selectedSlot.id,
      meetingSlotLabel: formatMeetingSlot(selectedSlot.startsAt),
      meetingSlotStartsAt: selectedSlot.startsAt,
      image: args.image,
      status: "new",
    });
    await ctx.runMutation(internal.notifications.createForAdmins, {
      kind: "review",
      title: "New ambassador application",
      description: `${name} submitted an application to join the program.`,
      href: `/ambassadors/applications/${applicationId}`,
    });
    await ctx.scheduler.runAfter(
      0,
      internal.applications.sendApplicationReceived,
      {
        applicationId,
      },
    );
    return applicationId;
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
      page: applications.page
        .filter((application) => application.status !== "accepted")
        .map(toApplication),
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

export const adminGetImageUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const checkEmailExists = query({
  args: { email: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_email", (q) =>
        q.eq("email", args.email.trim().toLowerCase()),
      )
      .first();
    return existing !== null;
  },
});

export const adminPendingCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [newApplications, reviewingApplications] = await Promise.all([
      ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", "new"))
        .take(5000),
      ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", "reviewing"))
        .take(5000),
    ]);

    return newApplications.length + reviewingApplications.length;
  },
});

export const adminReview = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(v.literal("reviewing"), v.literal("rejected")),
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

const meetingSlotSelectionValidator = v.union(
  v.object({
    status: v.literal("available"),
    name: v.string(),
    slots: v.array(
      v.object({
        id: v.string(),
        startsAt: v.number(),
        label: v.string(),
      }),
    ),
  }),
  v.object({ status: v.literal("expired") }),
  v.object({ status: v.literal("completed") }),
);

async function hashMeetingSlotSelectionToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export const getMeetingSlotSelection = query({
  args: { token: v.string(), now: v.number() },
  returns: meetingSlotSelectionValidator,
  handler: async (ctx, args) => {
    const tokenHash = await hashMeetingSlotSelectionToken(args.token);
    const application = await ctx.db
      .query("applications")
      .withIndex("by_meetingSlotSelectionTokenHash", (q) =>
        q.eq("meetingSlotSelectionTokenHash", tokenHash),
      )
      .first();

    // Once the meeting is scheduled the invitation states the time, so the
    // link must not be able to change it.
    if (
      application === null ||
      application.status !== "new" ||
      application.meetingSlotSelectionExpiresAt === undefined ||
      application.meetingSlotSelectionExpiresAt <= args.now
    ) {
      return { status: "expired" as const };
    }
    if (application.meetingSlotSelectionCompletedAt !== undefined) {
      return { status: "completed" as const };
    }

    return {
      status: "available" as const,
      name: application.name,
      slots: (await availableMeetingSlots(ctx, args.now, application._id)).map(
        (slot) => ({
          ...slot,
          label: formatMeetingSlot(slot.startsAt),
        }),
      ),
    };
  },
});

export const submitMeetingSlotSelection = mutation({
  args: {
    token: v.string(),
    meetingSlotId: meetingSlotIdValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const tokenHash = await hashMeetingSlotSelectionToken(args.token);
    const application = await ctx.db
      .query("applications")
      .withIndex("by_meetingSlotSelectionTokenHash", (q) =>
        q.eq("meetingSlotSelectionTokenHash", tokenHash),
      )
      .first();

    if (application === null) {
      throw new Error("This meeting time link is no longer valid.");
    }
    if (
      application.status !== "new" ||
      application.meetingSlotSelectionCompletedAt !== undefined ||
      application.meetingSlotSelectionExpiresAt === undefined ||
      application.meetingSlotSelectionExpiresAt <= Date.now()
    ) {
      throw new Error("This meeting time link is no longer valid.");
    }

    const available = await availableMeetingSlots(
      ctx,
      Date.now(),
      application._id,
    );
    const selectedSlot = available.find(
      (slot) => slot.id === args.meetingSlotId,
    );
    if (selectedSlot === undefined) {
      throw new Error("Choose one of the available meeting times.");
    }

    await ctx.db.patch(application._id, {
      meetingSlotId: selectedSlot.id,
      meetingSlotLabel: formatMeetingSlot(selectedSlot.startsAt),
      meetingSlotStartsAt: selectedSlot.startsAt,
      meetingSlotSelectionCompletedAt: Date.now(),
    });
    return null;
  },
});

export const createMeetingSlotSelectionRequest = internalMutation({
  args: {
    applicationId: v.id("applications"),
    tokenHash: v.string(),
    expiresAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const application = await ctx.db.get(args.applicationId);
    if (application === null) {
      throw new AuthError(404, "Application not found.");
    }
    if (application.status !== "new") {
      throw new Error("This application can no longer choose a meeting time.");
    }

    await ctx.db.patch(args.applicationId, {
      meetingSlotSelectionTokenHash: args.tokenHash,
      meetingSlotSelectionExpiresAt: args.expiresAt,
      meetingSlotSelectionSentAt: Date.now(),
      meetingSlotSelectionCompletedAt: undefined,
    });
    // The public query cannot read the clock, so expiry is enforced by
    // clearing the token server-side rather than trusting the caller's `now`.
    await ctx.scheduler.runAt(
      args.expiresAt,
      internal.applications.expireMeetingSlotSelection,
      { applicationId: args.applicationId, tokenHash: args.tokenHash },
    );
    return null;
  },
});

export const expireMeetingSlotSelection = internalMutation({
  args: {
    applicationId: v.id("applications"),
    tokenHash: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    // A newer link may have replaced this one; only revoke the one we scheduled.
    // A completed selection keeps its token so the link still reads "completed".
    if (
      application === null ||
      application.meetingSlotSelectionTokenHash !== args.tokenHash ||
      application.meetingSlotSelectionCompletedAt !== undefined
    ) {
      return null;
    }
    await ctx.db.patch(args.applicationId, {
      meetingSlotSelectionTokenHash: undefined,
    });
    return null;
  },
});

export const adminSendMeetingSlotSelection = action({
  args: { applicationId: v.id("applications") },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const details = await ctx.runQuery(
      internal.applications.acceptanceDetails,
      args,
    );
    if (details === null) throw new AuthError(404, "Application not found.");
    if (details.status !== "new") {
      throw new Error("This application can no longer choose a meeting time.");
    }

    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 72 * 60 * 60 * 1000;
    const tokenHash = await hashMeetingSlotSelectionToken(token);

    // Send before storing the new token: storing it revokes any link the
    // applicant already has, so a failed send must leave that link working.
    const email = meetingSlotSelectionEmail({
      name: details.name,
      selectionUrl: `${baseUrl()}/meeting-time#${token}`,
      logoUrl: EMAIL_LOGO_URL,
    });
    if (!(await trySendEmail(details.email, email))) return false;

    await ctx.runMutation(
      internal.applications.createMeetingSlotSelectionRequest,
      {
        applicationId: args.applicationId,
        tokenHash,
        expiresAt,
      },
    );
    return true;
  },
});

export const adminDeleteApplication = mutation({
  args: { applicationId: v.id("applications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const application = await ctx.db.get(args.applicationId);
    if (application === null) {
      throw new AuthError(404, "Application not found.");
    }
    // An accepted application has a live ambassador account behind it. Removing
    // that is a different decision, made from the ambassadors tab.
    if (application.status === "accepted") {
      throw new Error("An accepted application cannot be deleted here.");
    }

    // The uploaded photo has no other owner, so deleting the row would orphan
    // the file in storage forever.
    if (application.image !== undefined) {
      await ctx.storage.delete(application.image);
    }

    await ctx.db.delete(args.applicationId);
    return null;
  },
});

const emailDetailsValidator = v.object({
  name: v.string(),
  email: v.string(),
  status: applicationStatusValidator,
  meetingSlotLabel: v.union(v.string(), v.null()),
  meetingSlotStartsAt: v.union(v.number(), v.null()),
});

function emailDetails(application: Doc<"applications">) {
  return {
    name: application.name,
    email: application.email,
    status: application.status,
    meetingSlotLabel: application.meetingSlotLabel ?? null,
    meetingSlotStartsAt: application.meetingSlotStartsAt ?? null,
  };
}

export const applicationEmailDetails = internalQuery({
  args: { applicationId: v.id("applications") },
  returns: v.union(emailDetailsValidator, v.null()),
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (application === null) return null;
    return emailDetails(application);
  },
});

export const sendApplicationReceived = internalAction({
  args: { applicationId: v.id("applications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const details = await ctx.runQuery(
      internal.applications.applicationEmailDetails,
      args,
    );
    if (details === null) return null;
    const email = applicationReceivedEmail({
      name: details.name,
      selectedSlot: details.meetingSlotLabel,
      logoUrl: EMAIL_LOGO_URL,
    });
    await sendEmail(details.email, email);
    return null;
  },
});

export const markMeetingScheduled = internalMutation({
  args: { applicationId: v.id("applications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const application = await ctx.db.get(args.applicationId);
    if (application === null)
      throw new AuthError(404, "Application not found.");
    if (application.status !== "new") {
      throw new Error("This application has already moved past submitted.");
    }
    await ctx.db.patch(args.applicationId, {
      status: "reviewing",
      meetingScheduledAt: Date.now(),
      // Revoke any open selection link; the invitation fixes the time.
      meetingSlotSelectionTokenHash: undefined,
      meetingSlotSelectionExpiresAt: undefined,
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
    });
    return null;
  },
});

export const adminScheduleMeeting = action({
  args: { applicationId: v.id("applications") },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const details = await ctx.runQuery(
      internal.applications.acceptanceDetails,
      args,
    );
    if (details === null) throw new AuthError(404, "Application not found.");
    if (details.status !== "new") {
      throw new Error("This application has already moved past submitted.");
    }
    if (
      details.meetingSlotStartsAt === null ||
      details.meetingSlotStartsAt <= Date.now()
    ) {
      throw new Error(
        "The selected meeting time has passed. Select a new meeting time first.",
      );
    }
    const scheduleUrl = process.env.MEETING_SCHEDULING_URL;
    if (!scheduleUrl) {
      throw new Error(
        "Configure MEETING_SCHEDULING_URL before scheduling meetings.",
      );
    }
    const email = meetingScheduledEmail({
      name: details.name,
      scheduleUrl,
      selectedSlot: details.meetingSlotLabel,
      logoUrl: EMAIL_LOGO_URL,
    });
    // Schedule first so a failing email provider never blocks the meeting.
    await ctx.runMutation(internal.applications.markMeetingScheduled, args);
    return await trySendEmail(details.email, email);
  },
});

export const markApplicationDeclined = internalMutation({
  args: { applicationId: v.id("applications"), note: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const application = await ctx.db.get(args.applicationId);
    if (application === null)
      throw new AuthError(404, "Application not found.");
    if (application.status === "accepted") {
      throw new Error("An accepted application cannot be declined.");
    }
    await ctx.db.patch(args.applicationId, {
      status: "rejected",
      reviewNote: args.note.trim(),
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
    });
    return null;
  },
});

export const adminDecline = action({
  args: { applicationId: v.id("applications"), note: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const note = args.note.trim();
    if (note.length < 10)
      throw new Error("Add at least 10 characters of feedback.");
    if (note.length > 4000)
      throw new Error("Keep feedback under 4,000 characters.");
    const details = await ctx.runQuery(
      internal.applications.acceptanceDetails,
      {
        applicationId: args.applicationId,
      },
    );
    if (details === null) throw new AuthError(404, "Application not found.");
    if (details.status === "accepted") {
      throw new Error("An accepted application cannot be declined.");
    }
    const email = declinedApplicationEmail({
      name: details.name,
      note,
      logoUrl: EMAIL_LOGO_URL,
    });
    await sendEmail(details.email, email);
    await ctx.runMutation(internal.applications.markApplicationDeclined, {
      applicationId: args.applicationId,
      note,
    });
    return null;
  },
});

export const acceptanceDetails = internalQuery({
  args: { applicationId: v.id("applications") },
  returns: v.union(emailDetailsValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const application = await ctx.db.get(args.applicationId);
    if (application === null) return null;
    return emailDetails(application);
  },
});

export const userIdByEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    return user?._id ?? null;
  },
});

// An account with no role and no ambassador profile was never provisioned by
// an acceptance — in practice the leftover of an `adminAccept` that failed
// part-way. Admins and ambassadors always have a role, so they never match.
export const unprovisionedUserIdByEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    if (user === null || user.role !== undefined) return null;
    const profile = await ctx.db
      .query("ambassadorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    return profile === null ? user._id : null;
  },
});

export const acceptApplication = internalMutation({
  args: {
    applicationId: v.id("applications"),
    userId: v.id("users"),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const application = await ctx.db.get(args.applicationId);
    const user = await ctx.db.get(args.userId);
    if (application === null || user === null) {
      throw new AuthError(404, "Application not found.");
    }
    if (application.status === "accepted") {
      throw new Error("This application has already been accepted.");
    }

    const profile = await ctx.db
      .query("ambassadorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    const referralCode =
      profile?.referralCode ?? (await createReferralCode(ctx));
    const socials = Object.fromEntries(
      (application.socials ?? []).map(({ platform, handle }) => [
        platform,
        handle,
      ]),
    );

    // whyXolace is the applicant's own answer to why they applied; the portal
    // shows it as the profile bio, so it has to be carried over explicitly.
    const bio = application.whyXolace.trim();

    if (profile === null) {
      await ctx.db.insert("ambassadorProfiles", {
        userId: args.userId,
        referralCode,
        status: "active",
        track: application.trackInterest,
        location: application.location,
        school: application.school,
        dateOfBirth: application.dateOfBirth,
        bio,
        socials: {
          tiktok: socials.tiktok,
          instagram: socials.instagram,
          x: socials.x,
          youtube: socials.youtube,
          linkedin: socials.linkedin,
          snapchat: socials.snapchat,
        },
        onboardedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(profile._id, {
        referralCode,
        status: "active",
        track: application.trackInterest,
        location: application.location,
        school: application.school,
        dateOfBirth: application.dateOfBirth,
        bio,
        socials: {
          tiktok: socials.tiktok,
          instagram: socials.instagram,
          x: socials.x,
          youtube: socials.youtube,
          linkedin: socials.linkedin,
          snapchat: socials.snapchat,
        },
        onboardedAt: profile.onboardedAt ?? Date.now(),
      });
    }

    // The account is created by the password provider, which only sets the
    // email. Carry the name from the application so the ambassador is not
    // nameless in the portal and in the admin list.
    await ctx.db.patch(args.userId, {
      role: "ambassador",
      name: application.name,
      // The portal reads the avatar from the user row, so the photo uploaded
      // with the application has to be handed over or it never appears.
      ...(application.image !== undefined
        ? { avatarStorageId: application.image }
        : {}),
      passwordSetupRequired: true,
    });

    const ambassadorTotals = await ctx.db
      .query("ambassadorTotals")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (ambassadorTotals === null) {
      await ctx.db.insert("ambassadorTotals", {
        userId: args.userId,
        points: 0,
        levelRank: 1,
        contributionsApproved: 0,
        missionsCompleted: 0,
        peopleReached: 0,
        installs: 0,
        referrals: 0,
        contentCount: 0,
        eventCount: 0,
      });
    }

    if (application.referralCode !== undefined) {
      const referrerProfile = await ctx.db
        .query("ambassadorProfiles")
        .withIndex("by_referralCode", (q) =>
          q.eq("referralCode", application.referralCode),
        )
        .first();
      if (referrerProfile !== null && referrerProfile.userId !== args.userId) {
        const referrerTotals = await ctx.db
          .query("ambassadorTotals")
          .withIndex("by_userId", (q) => q.eq("userId", referrerProfile.userId))
          .first();
        if (referrerTotals === null) {
          await ctx.db.insert("ambassadorTotals", {
            userId: referrerProfile.userId,
            points: 0,
            levelRank: 1,
            contributionsApproved: 0,
            missionsCompleted: 0,
            peopleReached: 0,
            installs: 0,
            referrals: 1,
            contentCount: 0,
            eventCount: 0,
          });
        } else {
          await ctx.db.patch(referrerTotals._id, {
            referrals: referrerTotals.referrals + 1,
          });
        }
      }
    }

    await ctx.db.patch(args.applicationId, {
      status: "accepted",
      ambassadorId: args.userId,
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
    });
    return referralCode;
  },
});

export const markInvitationSent = internalMutation({
  args: { applicationId: v.id("applications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.applicationId, { invitationSentAt: Date.now() });
    return null;
  },
});

export const adminAccept = action({
  args: { applicationId: v.id("applications") },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const details = await ctx.runQuery(
      internal.applications.acceptanceDetails,
      {
        applicationId: args.applicationId,
      },
    );
    if (details === null) throw new AuthError(404, "Application not found.");
    if (details.status === "accepted") {
      throw new Error("This application has already been accepted.");
    }

    const temporaryPassword = generateTemporaryPassword();
    let userId: Id<"users"> | null = null;
    try {
      await ctx.runAction(api.auth.signIn, {
        provider: "password",
        params: {
          email: details.email,
          password: temporaryPassword,
          flow: "signUp",
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("already")) throw error;

      // A previous attempt may have created the account and then failed
      // before the acceptance was saved. That leftover has no role or profile,
      // so it can be taken over: new credentials replace whatever it was
      // created with and any session on it is ended. Anything else is a real
      // account and must not be touched.
      userId = await ctx.runQuery(
        internal.applications.unprovisionedUserIdByEmail,
        { email: details.email },
      );
      if (userId === null) {
        throw new Error(
          "An account already exists for this email. Provision it manually before accepting this application.",
        );
      }
      await modifyAccountCredentials(ctx, {
        provider: "password",
        account: { id: details.email, secret: temporaryPassword },
      });
      await invalidateSessions(ctx, { userId });
    }

    userId ??= await ctx.runQuery(internal.applications.userIdByEmail, {
      email: details.email,
    });
    if (userId === null)
      throw new Error("The ambassador account could not be found.");

    await ctx.runMutation(internal.applications.acceptApplication, {
      applicationId: args.applicationId,
      userId,
    });

    return await sendInvitation(
      ctx,
      args.applicationId,
      details,
      temporaryPassword,
    );
  },
});

export const invitationResendDetails = internalQuery({
  args: { applicationId: v.id("applications") },
  returns: v.object({
    details: emailDetailsValidator,
    userId: v.id("users"),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const application = await ctx.db.get(args.applicationId);
    if (application === null)
      throw new AuthError(404, "Application not found.");
    if (
      application.status !== "accepted" ||
      application.ambassadorId === undefined
    ) {
      throw new Error(
        "Only accepted applications have an invitation to resend.",
      );
    }
    const user = await ctx.db.get(application.ambassadorId);
    if (user === null) {
      throw new Error("The ambassador account could not be found.");
    }
    // Once the ambassador has chosen their own password the invitation has done
    // its job; issuing new credentials then would lock them out of the account
    // they are already using.
    if (user.passwordSetupRequired !== true) {
      throw new Error(
        "This ambassador has already set their password, so there is no invitation to resend.",
      );
    }
    return { details: emailDetails(application), userId: user._id };
  },
});

// Recovery path for an acceptance whose invitation email never arrived. The
// original temporary password only ever existed in that email, so it cannot be
// resent; instead a fresh one replaces it and any session that might have been
// started with the old one is ended.
export const adminResendInvitation = action({
  args: { applicationId: v.id("applications") },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const { details, userId } = await ctx.runQuery(
      internal.applications.invitationResendDetails,
      { applicationId: args.applicationId },
    );

    const temporaryPassword = generateTemporaryPassword();
    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: details.email, secret: temporaryPassword },
    });
    await invalidateSessions(ctx, { userId });

    return await sendInvitation(
      ctx,
      args.applicationId,
      details,
      temporaryPassword,
    );
  },
});

// Strip the uuid separators: it is emailed to a person to type, and a hyphen in
// the middle is easy to misread as a letter or dropped entirely. Still random
// per invitation, so it is never valid for another account.
function generateTemporaryPassword() {
  return `Xolace-${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

async function sendInvitation(
  ctx: ActionCtx,
  applicationId: Id<"applications">,
  details: { name: string; email: string; meetingSlotLabel: string | null },
  temporaryPassword: string,
) {
  const email = acceptedApplicationEmail({
    name: details.name,
    email: details.email,
    temporaryPassword,
    loginUrl: loginUrl(),
    selectedSlot: details.meetingSlotLabel,
    logoUrl: EMAIL_LOGO_URL,
  });
  const emailed = await trySendEmail(details.email, email);

  if (emailed) {
    await ctx.runMutation(internal.applications.markInvitationSent, {
      applicationId,
    });
  }
  return emailed;
}

// One-time repair for accounts created before `acceptApplication` started
// carrying the name and photo across from the application. Only fills what is
// missing, so re-running is a no-op and it never overwrites anything a user
// has since set themselves.
export const backfillAmbassadorProfiles = internalMutation({
  args: {},
  returns: v.object({
    scanned: v.number(),
    namesUpdated: v.number(),
    imagesUpdated: v.number(),
    biosUpdated: v.number(),
  }),
  // No requireAdmin here on purpose: `internalMutation` is already absent from
  // the public API, so no client can reach this. Adding an identity check would
  // only block the CLI/dashboard invocation this repair exists for.
  handler: async (ctx) => {
    const accepted = await ctx.db
      .query("applications")
      .withIndex("by_status", (q) => q.eq("status", "accepted"))
      .collect();

    let namesUpdated = 0;
    let imagesUpdated = 0;
    let biosUpdated = 0;
    for (const application of accepted) {
      const ambassadorId = application.ambassadorId;
      if (ambassadorId === undefined) continue;
      const user = await ctx.db.get(ambassadorId);
      if (user === null) continue;

      const patch: {
        name?: string;
        avatarStorageId?: Id<"_storage">;
      } = {};

      if ((user.name ?? "").trim().length === 0) {
        patch.name = application.name;
        namesUpdated++;
      }
      if (
        user.avatarStorageId === undefined &&
        application.image !== undefined
      ) {
        patch.avatarStorageId = application.image;
        imagesUpdated++;
      }
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(user._id, patch);
      }

      const profile = await ctx.db
        .query("ambassadorProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();
      const bio = application.whyXolace.trim();
      if (profile !== null && !profile.bio && bio.length > 0) {
        await ctx.db.patch(profile._id, { bio });
        biosUpdated++;
      }
    }
    return {
      scanned: accepted.length,
      namesUpdated,
      imagesUpdated,
      biosUpdated,
    };
  },
});

async function createReferralCode(ctx: Parameters<typeof requireAdmin>[0]) {
  for (;;) {
    const referralCode = `AMB-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
    const existing = await ctx.db
      .query("ambassadorProfiles")
      .withIndex("by_referralCode", (q) => q.eq("referralCode", referralCode))
      .first();
    if (existing === null) return referralCode;
  }
}

async function sendEmail(
  recipient: string,
  email: { subject: string; html: string; text: string },
) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    throw new Error(
      "Configure RESEND_API_KEY and RESEND_FROM_EMAIL before sending email.",
    );
  }
  const from = `Xolace Ambassador Team <${fromEmail}>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [recipient], ...email }),
  });
  if (!response.ok) {
    const responseBody = await response.text();
    let detail = responseBody;
    try {
      const parsed = JSON.parse(responseBody) as { message?: string };
      detail = parsed.message ?? responseBody;
    } catch {
      detail = responseBody;
    }
    throw new Error(`The email could not be sent: ${detail}`);
  }
}

// Best-effort send: returns false instead of throwing so a failing email
// provider never blocks the underlying state change (e.g. scheduling).
async function trySendEmail(
  recipient: string,
  email: { subject: string; html: string; text: string },
) {
  try {
    await sendEmail(recipient, email);
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}
