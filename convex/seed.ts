import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const demoAmbassadors = [
  {
    name: "Demo Ambassador 01",
    location: "Accra, Ghana",
    track: "creator",
    status: "active",
  },
  {
    name: "Demo Ambassador 02",
    location: "Kumasi, Ghana",
    track: "community",
    status: "active",
  },
  {
    name: "Demo Ambassador 03",
    location: "Lagos, Nigeria",
    track: "growth",
    status: "active",
  },
  {
    name: "Demo Ambassador 04",
    location: "Nairobi, Kenya",
    track: "creative",
    status: "active",
  },
  {
    name: "Demo Ambassador 05",
    location: "Dakar, Senegal",
    track: "production",
    status: "active",
  },
  {
    name: "Demo Ambassador 06",
    location: "Kigali, Rwanda",
    track: "advocacy",
    status: "active",
  },
  {
    name: "Demo Ambassador 07",
    location: "Tamale, Ghana",
    track: "creator",
    status: "active",
  },
  {
    name: "Demo Ambassador 08",
    location: "Abuja, Nigeria",
    track: "community",
    status: "active",
  },
  {
    name: "Demo Ambassador 09",
    location: "Kampala, Uganda",
    track: "growth",
    status: "active",
  },
  {
    name: "Demo Ambassador 10",
    location: "Cape Coast, Ghana",
    track: "creative",
    status: "active",
  },
  {
    name: "Demo Ambassador 11",
    location: "Lusaka, Zambia",
    track: "production",
    status: "active",
  },
  {
    name: "Demo Ambassador 12",
    location: "Monrovia, Liberia",
    track: "advocacy",
    status: "active",
  },
  {
    name: "Demo Ambassador 13",
    location: "Accra, Ghana",
    track: "community",
    status: "paused",
  },
  {
    name: "Demo Ambassador 14",
    location: "Lagos, Nigeria",
    track: "creator",
    status: "paused",
  },
  {
    name: "Demo Ambassador 15",
    location: "Nairobi, Kenya",
    track: "growth",
    status: "suspended",
  },
] as const;

export const seedDemoAmbassadors = internalMutation({
  args: {},
  returns: v.object({
    usersCreated: v.number(),
    profilesCreated: v.number(),
    totalsCreated: v.number(),
  }),
  handler: async (ctx) => {
    let usersCreated = 0;
    let profilesCreated = 0;
    let totalsCreated = 0;

    for (const [index, ambassador] of demoAmbassadors.entries()) {
      const email = `demo.ambassador.${String(index + 1).padStart(2, "0")}@example.test`;
      let user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .first();

      if (user === null) {
        const userId = await ctx.db.insert("users", {
          name: ambassador.name,
          email,
          role: "ambassador",
        });
        user = await ctx.db.get(userId);
        usersCreated += 1;
      }

      if (user === null || user.role !== "ambassador") {
        throw new Error(`The demo email ${email} belongs to a non-ambassador.`);
      }

      const profile = await ctx.db
        .query("ambassadorProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();
      if (profile === null) {
        await ctx.db.insert("ambassadorProfiles", {
          userId: user._id,
          status: ambassador.status,
          track: ambassador.track,
          location: ambassador.location,
          school: "Demo community",
          onboardedAt: Date.now(),
        });
        profilesCreated += 1;
      }

      const totals = await ctx.db
        .query("ambassadorTotals")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();
      if (totals === null) {
        await ctx.db.insert("ambassadorTotals", {
          userId: user._id,
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
        totalsCreated += 1;
      }
    }

    return { usersCreated, profilesCreated, totalsCreated };
  },
});
