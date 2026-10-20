import { v } from "convex/values";
import { query } from "./_generated/server";

// The public showcase is deliberately unauthenticated: anyone can read who is in
// the program. It lives in its own file so the whole public surface can be
// audited at a glance.
//
// The `returns` validator below IS the allowlist. Only fields intended for
// public display may appear here. Email, uuid, dateOfBirth, role and
// passwordSetupRequired must never be added — they are either private or
// credential-adjacent.

const publicAmbassadorValidator = v.object({
  id: v.string(),
  name: v.string(),
  image: v.union(v.string(), v.null()),
  location: v.union(v.string(), v.null()),
  track: v.union(v.string(), v.null()),
  bio: v.union(v.string(), v.null()),
  joinedAt: v.number(),
  peopleReached: v.number(),
  missionsCompleted: v.number(),
  eventsHosted: v.number(),
  contributions: v.number(),
  socials: v.union(
    v.object({
      tiktok: v.union(v.string(), v.null()),
      instagram: v.union(v.string(), v.null()),
      x: v.union(v.string(), v.null()),
      youtube: v.union(v.string(), v.null()),
      linkedin: v.union(v.string(), v.null()),
      snapchat: v.union(v.string(), v.null()),
    }),
    v.null(),
  ),
});

const MAX_LIMIT = 500;

// "points" mirrors the all-time leaderboard: highest scoring first.
// "recent" is the newest onboarded first, used for the showcase section.
const orderValidator = v.union(v.literal("points"), v.literal("recent"));

const publicSummaryValidator = v.object({
  activeAmbassadors: v.number(),
  countries: v.number(),
  peopleReached: v.number(),
  eventsHosted: v.number(),
});

// An empty handle means the platform column was filled with a blank string
// rather than left empty. Publish it as absent so the card does not render a
// dead social link.
function handle(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export const list = query({
  args: {
    limit: v.optional(v.number()),
    order: v.optional(orderValidator),
  },
  returns: v.array(publicAmbassadorValidator),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 24, MAX_LIMIT);
    const order = args.order ?? "points";

    const profiles = await ctx.db
      .query("ambassadorProfiles")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(limit);

    const totals = await Promise.all(
      profiles.map(async (profile) => {
        const total = await ctx.db
          .query("ambassadorTotals")
          .withIndex("by_userId", (q) => q.eq("userId", profile.userId))
          .first();
        return [profile.userId, total?.points ?? 0] as const;
      }),
    );
    const pointsByUserId = new Map(totals);

    profiles.sort((a, b) => {
      if (order === "points") {
        return (
          (pointsByUserId.get(b.userId) ?? 0) -
          (pointsByUserId.get(a.userId) ?? 0)
        );
      }
      return (
        (b.onboardedAt ?? b._creationTime) - (a.onboardedAt ?? a._creationTime)
      );
    });

    const rows = await Promise.all(
      profiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        // No account means nothing to show; skip rather than emit a shell.
        if (user === null) return null;
        // An accepted ambassador must have a name; without one the card would
        // render blank, so fall through rather than publish an empty entry.
        const name = user.name?.trim() ?? "";
        if (name.length === 0) return null;

        const [total, image] = await Promise.all([
          ctx.db
            .query("ambassadorTotals")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first(),
          user.avatarStorageId
            ? ctx.storage.getUrl(user.avatarStorageId)
            : Promise.resolve(null),
        ]);

        return {
          id: user._id,
          name,
          image: image ?? user.image ?? null,
          location: profile.location ?? null,
          track: profile.track ?? null,
          bio: profile.bio ?? null,
          joinedAt: profile.onboardedAt ?? user._creationTime,
          peopleReached: total?.peopleReached ?? 0,
          missionsCompleted: total?.missionsCompleted ?? 0,
          eventsHosted: total?.eventCount ?? 0,
          contributions: total?.contributionsApproved ?? 0,
          socials: profile.socials
            ? {
                tiktok: handle(profile.socials.tiktok),
                instagram: handle(profile.socials.instagram),
                x: handle(profile.socials.x),
                youtube: handle(profile.socials.youtube),
                linkedin: handle(profile.socials.linkedin),
                snapchat: handle(profile.socials.snapchat),
              }
            : null,
        };
      }),
    );

    return rows.filter((row) => row !== null);
  },
});

export const summary = query({
  args: {},
  returns: publicSummaryValidator,
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query("ambassadorProfiles")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(MAX_LIMIT);

    const locations = new Set<string>();
    let peopleReached = 0;
    let eventsHosted = 0;
    let activeAmbassadors = 0;

    for (const profile of profiles) {
      const user = await ctx.db.get(profile.userId);
      if (user === null || !user.name?.trim()) continue;

      activeAmbassadors++;
      const location = profile.location?.trim();
      if (location) locations.add(location.toLowerCase());

      const totals = await ctx.db
        .query("ambassadorTotals")
        .withIndex("by_userId", (q) => q.eq("userId", profile.userId))
        .first();
      peopleReached += totals?.peopleReached ?? 0;
      eventsHosted += totals?.eventCount ?? 0;
    }

    return {
      activeAmbassadors,
      countries: locations.size,
      peopleReached,
      eventsHosted,
    };
  },
});
