import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
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
  declinedApplicationEmail,
  meetingScheduledEmail,
} from "./emailTemplates";
import { DEFAULT_MEETING_SLOTS, formatMeetingSlot } from "./meetingSlots";
import { AuthError, requireAdmin } from "./model/auth";
import { trackValidator } from "./schema";

const applicationStatusValidator = v.union(
  v.literal("new"),
  v.literal("reviewing"),
  v.literal("accepted"),
  v.literal("rejected"),
);

const meetingSlotIdValidator = v.string();

function getMeetingSlot(id: string) {
  return DEFAULT_MEETING_SLOTS.find((slot) => slot.id === id);
}

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
async function availableMeetingSlots(
  ctx: Parameters<typeof requireAdmin>[0],
  now: number,
) {
  const configured = await ctx.db
    .query("meetingSlots")
    .withIndex("by_active_and_startsAt", (q) =>
      q.eq("active", true).gt("startsAt", now),
    )
    .order("asc")
    .take(100);
  const slots =
    configured.length > 0
      ? configured.map((slot) => ({
          id: slot.slotKey,
          startsAt: slot.startsAt,
        }))
      : DEFAULT_MEETING_SLOTS.filter((slot) => slot.startsAt > now);
  const available = await Promise.all(
    slots.map(async (slot) => {
      const booking = await ctx.db
        .query("applications")
        .withIndex("by_meetingSlotId", (q) => q.eq("meetingSlotId", slot.id))
        .first();
      return booking?.status === undefined || booking.status === "rejected"
        ? slot
        : null;
    }),
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
    meetingSlotId: v.optional(meetingSlotIdValidator),
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

    // The meeting time is required while slots exist, but an applicant must not
    // be blocked from applying when none are available.
    let meetingSlot: { id: string; startsAt: number } | undefined;
    const requestedSlotId = args.meetingSlotId;
    if (requestedSlotId !== undefined) {
      const configuredMeetingSlot = await ctx.db
        .query("meetingSlots")
        .withIndex("by_slotKey", (q) => q.eq("slotKey", requestedSlotId))
        .first();
      const candidate =
        configuredMeetingSlot ?? getMeetingSlot(requestedSlotId);
      if (
        candidate === undefined ||
        candidate.startsAt <= now ||
        configuredMeetingSlot?.active === false
      ) {
        throw new Error("Choose one of the available meeting times.");
      }
      const existingSlotApplication = await ctx.db
        .query("applications")
        .withIndex("by_meetingSlotId", (q) =>
          q.eq("meetingSlotId", requestedSlotId),
        )
        .first();
      if (
        existingSlotApplication?.status !== undefined &&
        existingSlotApplication.status !== "rejected"
      ) {
        throw new Error(
          "That meeting time has already been taken. Choose another time.",
        );
      }
      meetingSlot = { id: requestedSlotId, startsAt: candidate.startsAt };
    } else {
      const available = await availableMeetingSlots(ctx, now);
      if (available.length > 0) {
        throw new Error("Choose one of the available meeting times.");
      }
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
      ...(meetingSlot
        ? {
            meetingSlotId: meetingSlot.id,
            meetingSlotLabel: formatMeetingSlot(meetingSlot.startsAt),
            meetingSlotStartsAt: meetingSlot.startsAt,
          }
        : {}),
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

const emailDetailsValidator = v.object({
  name: v.string(),
  email: v.string(),
  status: applicationStatusValidator,
  meetingSlotLabel: v.union(v.string(), v.null()),
});

function emailDetails(application: Doc<"applications">) {
  return {
    name: application.name,
    email: application.email,
    status: application.status,
    meetingSlotLabel: application.meetingSlotLabel ?? null,
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
      scheduleUrl: process.env.MEETING_SCHEDULING_URL ?? "",
      selectedSlot: details.meetingSlotLabel,
      logoUrl: `${baseUrl()}/icon.png`,
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
      logoUrl: `${baseUrl()}/icon.png`,
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
      logoUrl: `${baseUrl()}/icon.png`,
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

    if (profile === null) {
      await ctx.db.insert("ambassadorProfiles", {
        userId: args.userId,
        referralCode,
        status: "active",
        track: application.trackInterest,
        location: application.location,
        school: application.school,
        dateOfBirth: application.dateOfBirth,
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
        onboardedAt: profile.onboardedAt ?? Date.now(),
      });
    }

    await ctx.db.patch(args.userId, {
      role: "ambassador",
      passwordSetupRequired: true,
    });

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

    const temporaryPassword = `Xolace-${crypto.randomUUID().slice(0, 12)}`;
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
      if (message.includes("already exists") || message.includes("already")) {
        throw new Error(
          "An account already exists for this email. Provision it manually before accepting this application.",
        );
      }
      throw error;
    }

    const userId = await ctx.runQuery(internal.applications.userIdByEmail, {
      email: details.email,
    });
    if (userId === null)
      throw new Error("The ambassador account could not be found.");

    const referralCode = await ctx.runMutation(
      internal.applications.acceptApplication,
      {
        applicationId: args.applicationId,
        userId,
      },
    );

    const email = acceptedApplicationEmail({
      name: details.name,
      email: details.email,
      temporaryPassword,
      loginUrl: `${baseUrl()}/login`,
      referralCode,
      selectedSlot: details.meetingSlotLabel,
      logoUrl: `${baseUrl()}/icon.png`,
    });
    const emailed = await trySendEmail(details.email, email);

    if (emailed) {
      await ctx.runMutation(internal.applications.markInvitationSent, {
        applicationId: args.applicationId,
      });
    }
    return emailed;
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

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function sendEmail(
  recipient: string,
  email: { subject: string; html: string; text: string },
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error(
      "Configure RESEND_API_KEY and RESEND_FROM_EMAIL before sending email.",
    );
  }
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
