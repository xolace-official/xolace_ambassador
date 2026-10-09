import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { type QueryCtx, query } from "./_generated/server";

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

const MAX_LIMIT = 48;

// "points" mirrors the all-time leaderboard: highest scoring first.
// "recent" is the newest onboarded first, used for the showcase section.
const orderValidator = v.union(v.literal("points"), v.literal("recent"));

// An empty handle means the platform column was filled with a blank string
// rather than left empty. Publish it as absent so the card does not render a
// dead social link.
function handle(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

async function profileFor(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<Doc<"ambassadorProfiles"> | null> {
  const profile = await ctx.db
    .query("ambassadorProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
  if (profile === null || profile.status !== "active") return null;
  return profile;
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

    // Leaderboard order starts from the totals index, which is already sorted
    // by points; only ambassadors with a totals row can rank.
    const ranked = await ctx.db
      .query("ambassadorTotals")
      .withIndex("by_points")
      .order("desc")
      .take(limit);

    const byId = new Map<Id<"users">, Id<"ambassadorProfiles">>();

    const candidates =
      order === "points"
        ? await Promise.all(
            ranked.map(async (total) => {
              const profile = await profileFor(ctx, total.userId);
              if (profile === null) return null;
              byId.set(total.userId, profile._id);
              return profile;
            }),
          )
        : await ctx.db
            .query("ambassadorProfiles")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .take(limit);

    const profiles = (
      candidates.filter((p) => p !== null) as Doc<"ambassadorProfiles">[]
    )
      .sort(
        (a, b) =>
          (b.onboardedAt ?? b._creationTime) -
          (a.onboardedAt ?? a._creationTime),
      )
      .slice(0, limit);

    const rows = await Promise.all(
      profiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        // No account means nothing to show; skip rather than emit a shell.
        if (user === null) return null;
        // An accepted ambassador must have a name; without one the card would
        // render blank, so fall through rather than publish an empty entry.
        const name = user.name?.trim() ?? "";
        if (name.length === 0) return null;

        const [totals, image] = await Promise.all([
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
          peopleReached: totals?.peopleReached ?? 0,
          missionsCompleted: totals?.missionsCompleted ?? 0,
          eventsHosted: totals?.eventCount ?? 0,
          contributions: totals?.contributionsApproved ?? 0,
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
