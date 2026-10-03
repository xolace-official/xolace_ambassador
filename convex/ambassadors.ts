import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { AuthError, requireAdmin, requireRole } from "./model/auth";

const ambassadorStatusValidator = v.union(
  v.literal("active"),
  v.literal("paused"),
  v.literal("suspended"),
);

const ambassadorRowValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  name: v.union(v.string(), v.null()),
  email: v.union(v.string(), v.null()),
  status: ambassadorStatusValidator,
  track: v.union(
    v.literal("creator"),
    v.literal("community"),
    v.literal("growth"),
    v.literal("creative"),
    v.literal("production"),
    v.literal("advocacy"),
    v.null(),
  ),
  location: v.union(v.string(), v.null()),
  podName: v.union(v.string(), v.null()),
  points: v.number(),
  missionsCompleted: v.number(),
  lastActivityAt: v.union(v.number(), v.null()),
});

const profileValidator = v.union(
  v.object({
    status: ambassadorStatusValidator,
    track: v.union(
      v.literal("creator"),
      v.literal("community"),
      v.literal("growth"),
      v.literal("creative"),
      v.literal("production"),
      v.literal("advocacy"),
      v.null(),
    ),
    location: v.union(v.string(), v.null()),
    school: v.union(v.string(), v.null()),
    bio: v.union(v.string(), v.null()),
    podName: v.union(v.string(), v.null()),
    onboardedAt: v.union(v.number(), v.null()),
    safetyAcknowledgedAt: v.union(v.number(), v.null()),
  }),
  v.null(),
);

const totalsValidator = v.object({
  points: v.number(),
  levelRank: v.number(),
  contributionsApproved: v.number(),
  missionsCompleted: v.number(),
  peopleReached: v.number(),
  installs: v.number(),
  referrals: v.number(),
  contentCount: v.number(),
  eventCount: v.number(),
});

const contributionValidator = v.object({
  _id: v.id("contributions"),
  _creationTime: v.number(),
  title: v.string(),
  missionTitle: v.union(v.string(), v.null()),
  kind: v.union(
    v.literal("mission_submission"),
    v.literal("people_reached"),
    v.literal("app_install"),
    v.literal("referral"),
    v.literal("content"),
    v.literal("event"),
    v.literal("other"),
  ),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("declined"),
  ),
  quantity: v.union(v.number(), v.null()),
  awardedPoints: v.union(v.number(), v.null()),
});

const recognitionValidator = v.object({
  _id: v.id("recognitions"),
  _creationTime: v.number(),
  kind: v.union(
    v.literal("spotlight"),
    v.literal("featured"),
    v.literal("pod_lead"),
    v.literal("fellowship"),
  ),
  note: v.string(),
  awardedByName: v.union(v.string(), v.null()),
});

const eventValidator = v.object({
  _id: v.id("events"),
  title: v.string(),
  startsAt: v.number(),
  status: v.union(v.literal("going"), v.literal("interested")),
});

const selfProfileValidator = v.union(
  v.object({
    status: ambassadorStatusValidator,
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
    location: v.union(v.string(), v.null()),
    school: v.union(v.string(), v.null()),
    bio: v.union(v.string(), v.null()),
    onboardedAt: v.union(v.number(), v.null()),
    safetyAcknowledgedAt: v.union(v.number(), v.null()),
    socials: v.object({
      tiktok: v.union(v.string(), v.null()),
      instagram: v.union(v.string(), v.null()),
      x: v.union(v.string(), v.null()),
      youtube: v.union(v.string(), v.null()),
      linkedin: v.union(v.string(), v.null()),
      snapchat: v.union(v.string(), v.null()),
    }),
  }),
  v.null(),
);

const selfContributionValidator = v.object({
  _id: v.id("contributions"),
  _creationTime: v.number(),
  title: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("declined"),
  ),
  awardedPoints: v.union(v.number(), v.null()),
});

const selfRecognitionValidator = v.object({
  _id: v.id("recognitions"),
  _creationTime: v.number(),
  kind: v.union(
    v.literal("spotlight"),
    v.literal("featured"),
    v.literal("pod_lead"),
    v.literal("fellowship"),
  ),
  note: v.string(),
});

const levelValidator = v.union(
  v.object({
    name: v.string(),
    description: v.string(),
    minPoints: v.number(),
  }),
  v.null(),
);

export const adminList = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(ambassadorStatusValidator),
    search: v.optional(v.string()),
  },
  returns: paginationResultValidator(ambassadorRowValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const search = args.search?.trim();
    const status = args.status;
    const page = search
      ? await ctx.db
          .query("users")
          .withSearchIndex("search_name", (q) => {
            const searchFilter = q
              .search("name", search)
              .eq("role", "ambassador");
            return searchFilter;
          })
          .paginate(args.paginationOpts)
      : status && status !== "active"
        ? await ctx.db
            .query("ambassadorProfiles")
            .withIndex("by_status", (q) => q.eq("status", status))
            .order("desc")
            .paginate(args.paginationOpts)
        : await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "ambassador"))
            .order("desc")
            .paginate(args.paginationOpts);

    return {
      ...page,
      page: await Promise.all(
        page.page.map(async (entry) => {
          const profileEntry = "userId" in entry ? entry : null;
          const user =
            "userId" in entry ? await ctx.db.get(entry.userId) : entry;
          if (user === null || user.role !== "ambassador") return null;

          const [profile, totals, latestContribution] = await Promise.all([
            profileEntry
              ? Promise.resolve(profileEntry)
              : ctx.db
                  .query("ambassadorProfiles")
                  .withIndex("by_userId", (q) => q.eq("userId", user._id))
                  .first(),
            ctx.db
              .query("ambassadorTotals")
              .withIndex("by_userId", (q) => q.eq("userId", user._id))
              .first(),
            ctx.db
              .query("contributions")
              .withIndex("by_ambassadorId", (q) =>
                q.eq("ambassadorId", user._id),
              )
              .order("desc")
              .first(),
          ]);
          const pod = profile?.podId ? await ctx.db.get(profile.podId) : null;

          const row = {
            _id: user._id,
            _creationTime: user._creationTime,
            name: user.name?.trim() || null,
            email: user.email?.trim() || null,
            status: profile?.status ?? "active",
            track: profile?.track ?? null,
            location: profile?.location ?? null,
            podName: pod?.name ?? null,
            points: totals?.points ?? 0,
            missionsCompleted: totals?.missionsCompleted ?? 0,
            lastActivityAt: latestContribution?._creationTime ?? null,
          };
          return status !== undefined && row.status !== status ? null : row;
        }),
      ).then((rows) => rows.filter((row) => row !== null)),
    };
  },
});

export const adminGet = query({
  args: { ambassadorId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      name: v.union(v.string(), v.null()),
      email: v.union(v.string(), v.null()),
      joinedAt: v.number(),
      profile: profileValidator,
      totals: v.union(totalsValidator, v.null()),
      contributions: v.array(contributionValidator),
      recognitions: v.array(recognitionValidator),
      events: v.array(eventValidator),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const id = ctx.db.normalizeId("users", args.ambassadorId);
    if (id === null) return null;

    const user = await ctx.db.get(id);
    if (user === null || user.role !== "ambassador") return null;

    const [profile, totals, contributions, recognitions, rsvps] =
      await Promise.all([
        ctx.db
          .query("ambassadorProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", id))
          .first(),
        ctx.db
          .query("ambassadorTotals")
          .withIndex("by_userId", (q) => q.eq("userId", id))
          .first(),
        ctx.db
          .query("contributions")
          .withIndex("by_ambassadorId", (q) => q.eq("ambassadorId", id))
          .order("desc")
          .take(20),
        ctx.db
          .query("recognitions")
          .withIndex("by_userId", (q) => q.eq("userId", id))
          .order("desc")
          .take(20),
        ctx.db
          .query("eventRsvps")
          .withIndex("by_userId", (q) => q.eq("userId", id))
          .take(20),
      ]);

    const pod = profile?.podId ? await ctx.db.get(profile.podId) : null;
    const mappedProfile = profile
      ? {
          status: profile.status,
          track: profile.track ?? null,
          location: profile.location ?? null,
          school: profile.school ?? null,
          bio: profile.bio ?? null,
          podName: pod?.name ?? null,
          onboardedAt: profile.onboardedAt ?? null,
          safetyAcknowledgedAt: profile.safetyAcknowledgedAt ?? null,
        }
      : null;

    const [mappedContributions, mappedRecognitions, mappedEvents] =
      await Promise.all([
        Promise.all(
          contributions.map(async (contribution) => {
            const mission = contribution.missionId
              ? await ctx.db.get(contribution.missionId)
              : null;
            return {
              _id: contribution._id,
              _creationTime: contribution._creationTime,
              title: contribution.title,
              missionTitle: mission?.title ?? null,
              kind: contribution.kind,
              status: contribution.status,
              quantity: contribution.quantity ?? null,
              awardedPoints: contribution.awardedPoints ?? null,
            };
          }),
        ),
        Promise.all(
          recognitions.map(async (recognition) => {
            const admin = await ctx.db.get(recognition.awardedBy);
            return {
              _id: recognition._id,
              _creationTime: recognition._creationTime,
              kind: recognition.kind,
              note: recognition.note,
              awardedByName: admin?.name?.trim() || null,
            };
          }),
        ),
        Promise.all(
          rsvps.map(async (rsvp) => {
            const event = await ctx.db.get(rsvp.eventId);
            return event
              ? {
                  _id: event._id,
                  title: event.title,
                  startsAt: event.startsAt,
                  status: rsvp.status,
                }
              : null;
          }),
        ),
      ]);

    return {
      _id: user._id,
      name: user.name?.trim() || null,
      email: user.email?.trim() || null,
      joinedAt: user._creationTime,
      profile: mappedProfile,
      totals: totals
        ? {
            points: totals.points,
            levelRank: totals.levelRank,
            contributionsApproved: totals.contributionsApproved,
            missionsCompleted: totals.missionsCompleted,
            peopleReached: totals.peopleReached,
            installs: totals.installs,
            referrals: totals.referrals,
            contentCount: totals.contentCount,
            eventCount: totals.eventCount,
          }
        : null,
      contributions: mappedContributions,
      recognitions: mappedRecognitions,
      events: mappedEvents.filter((event) => event !== null),
    };
  },
});

export const getProfile = query({
  args: {},
  returns: v.object({
    role: v.union(v.literal("admin"), v.literal("ambassador")),
    name: v.union(v.string(), v.null()),
    email: v.union(v.string(), v.null()),
    image: v.union(v.string(), v.null()),
    joinedAt: v.number(),
    profile: selfProfileValidator,
    totals: v.union(totalsValidator, v.null()),
    currentLevel: levelValidator,
    nextLevel: levelValidator,
    contributions: v.array(selfContributionValidator),
    recognitions: v.array(selfRecognitionValidator),
  }),
  handler: async (ctx) => {
    const caller = await requireRole(ctx);
    const role: "admin" | "ambassador" =
      caller.role === "admin" ? "admin" : "ambassador";
    const profile = await ctx.db
      .query("ambassadorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", caller._id))
      .first();

    const totals =
      caller.role === "ambassador"
        ? await ctx.db
            .query("ambassadorTotals")
            .withIndex("by_userId", (q) => q.eq("userId", caller._id))
            .first()
        : null;

    const contributions =
      caller.role === "ambassador"
        ? await ctx.db
            .query("contributions")
            .withIndex("by_ambassadorId", (q) =>
              q.eq("ambassadorId", caller._id),
            )
            .order("desc")
            .take(5)
        : [];
    const recognitions =
      caller.role === "ambassador"
        ? await ctx.db
            .query("recognitions")
            .withIndex("by_userId", (q) => q.eq("userId", caller._id))
            .order("desc")
            .take(5)
        : [];

    const currentLevel = totals
      ? await ctx.db
          .query("levels")
          .withIndex("by_rank", (q) => q.eq("rank", totals.levelRank))
          .first()
      : null;
    const nextLevel = totals
      ? await ctx.db
          .query("levels")
          .withIndex("by_rank", (q) => q.gt("rank", totals.levelRank))
          .order("asc")
          .first()
      : null;
    const pod = profile?.podId ? await ctx.db.get(profile.podId) : null;
    const storedImage = caller.avatarStorageId
      ? await ctx.storage.getUrl(caller.avatarStorageId)
      : null;

    return {
      role,
      name: caller.name?.trim() || null,
      email: caller.email?.trim() || null,
      image: storedImage ?? caller.image ?? null,
      joinedAt: caller._creationTime,
      profile: profile
        ? {
            status: profile.status,
            track: profile.track ?? null,
            podName: pod?.name ?? null,
            location: profile.location ?? null,
            school: profile.school ?? null,
            bio: profile.bio ?? null,
            onboardedAt: profile.onboardedAt ?? null,
            safetyAcknowledgedAt: profile.safetyAcknowledgedAt ?? null,
            socials: {
              tiktok: profile.socials?.tiktok ?? null,
              instagram: profile.socials?.instagram ?? null,
              x: profile.socials?.x ?? null,
              youtube: profile.socials?.youtube ?? null,
              linkedin: profile.socials?.linkedin ?? null,
              snapchat: profile.socials?.snapchat ?? null,
            },
          }
        : null,
      totals: totals
        ? {
            points: totals.points,
            levelRank: totals.levelRank,
            contributionsApproved: totals.contributionsApproved,
            missionsCompleted: totals.missionsCompleted,
            peopleReached: totals.peopleReached,
            installs: totals.installs,
            referrals: totals.referrals,
            contentCount: totals.contentCount,
            eventCount: totals.eventCount,
          }
        : null,
      currentLevel: currentLevel
        ? {
            name: currentLevel.name,
            description: currentLevel.description,
            minPoints: currentLevel.minPoints,
          }
        : null,
      nextLevel: nextLevel
        ? {
            name: nextLevel.name,
            description: nextLevel.description,
            minPoints: nextLevel.minPoints,
          }
        : null,
      contributions: contributions.map((contribution) => ({
        _id: contribution._id,
        _creationTime: contribution._creationTime,
        title: contribution.title,
        status: contribution.status,
        awardedPoints: contribution.awardedPoints ?? null,
      })),
      recognitions: recognitions.map((recognition) => ({
        _id: recognition._id,
        _creationTime: recognition._creationTime,
        kind: recognition.kind,
        note: recognition.note,
      })),
    };
  },
});

export const getTotals = query({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      points: v.number(),
      levelRank: v.number(),
      contributionsApproved: v.number(),
      missionsCompleted: v.number(),
      peopleReached: v.number(),
      installs: v.number(),
      referrals: v.number(),
      contentCount: v.number(),
      eventCount: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const totals = await ctx.db
      .query("ambassadorTotals")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    return totals;
  },
});

export const adminSetStatus = mutation({
  args: {
    ambassadorId: v.id("users"),
    status: ambassadorStatusValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.ambassadorId);
    if (user === null || user.role !== "ambassador") {
      throw new AuthError(404, "Ambassador not found.");
    }

    const profile = await ctx.db
      .query("ambassadorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.ambassadorId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, { status: args.status });
    } else {
      await ctx.db.insert("ambassadorProfiles", {
        userId: args.ambassadorId,
        status: args.status,
        ...(args.status === "active" ? { onboardedAt: Date.now() } : {}),
      });
    }

    return null;
  },
});
