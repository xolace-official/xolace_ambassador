import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// Starting values for the admin-editable program configuration. These mirror
// the published program structure; an admin can retune any of them from the
// portal afterwards, and nothing here needs a deploy to change.
//
// `applyDefaults` upserts by `key`/`slug`, so re-running it refreshes these
// rows without touching anything an admin has since customised.

const DEFAULT_LEVELS = [
  {
    rank: 1,
    key: "xolacer",
    name: "Xolacer",
    minPoints: 0,
    description: "New ambassador. Learning the mission.",
  },
  {
    rank: 2,
    key: "ambassador",
    name: "Ambassador",
    minPoints: 100,
    description: "Consistently contributing.",
  },
  {
    rank: 3,
    key: "pod_member",
    name: "Pod Member",
    minPoints: 300,
    description: "Specialises in a growth, community or production pod.",
  },
  {
    rank: 4,
    key: "pod_lead",
    name: "Pod Lead",
    minPoints: 750,
    description: "Leads a team or a project.",
  },
  {
    rank: 5,
    key: "fellow",
    name: "Xolace Fellow",
    minPoints: 1500,
    description: "Top contributors with closer access to the team.",
  },
];

// Deliberately weighted toward contribution and craft rather than acquisition.
// App installs earn the least of any award because the product is mental-health
// software: we never want an ambassador pushing a download at someone in a
// vulnerable moment to earn points.
const DEFAULT_POINT_ACTIONS = [
  {
    key: "share_campaign",
    label: "Share a campaign",
    points: 5,
    description: "Reshare an official Xolace campaign post.",
    track: undefined,
    active: true,
  },
  {
    key: "create_content",
    label: "Create original content",
    points: 20,
    description: "Original post, video or story made for a mission.",
    track: "creator" as const,
    active: true,
  },
  {
    key: "create_campaign_concept",
    label: "Create a campaign concept",
    points: 40,
    description: "A campaign idea the team can actually run.",
    track: "creative" as const,
    active: true,
  },
  {
    key: "produce_video",
    label: "Produce an approved video",
    points: 50,
    description: "Video or film production that passes review.",
    track: "production" as const,
    active: true,
  },
  {
    key: "host_activity",
    label: "Host a community activity",
    points: 50,
    description: "Run a conversation, workshop or awareness activity.",
    track: "community" as const,
    active: true,
  },
  {
    key: "lead_event",
    label: "Lead an event",
    points: 75,
    description: "Plan and host a full program event end to end.",
    track: "community" as const,
    active: true,
  },
  {
    key: "recruit_ambassador",
    label: "Recruit an ambassador",
    points: 30,
    description: "Guide a new applicant through to acceptance.",
    track: "growth" as const,
    active: true,
  },
  {
    key: "referral",
    label: "Bring someone to a Xolace session",
    points: 10,
    description:
      "A real person chose to talk because you mentioned Xolace once.",
    track: "growth" as const,
    active: true,
  },
  {
    key: "app_install",
    label: "Someone installed the app after hearing about it",
    points: 5,
    description:
      "Counted, but weighted lowest on purpose. Never a reason to push a download.",
    track: "growth" as const,
    active: true,
  },
  {
    key: "safety_training",
    label: "Complete safety and ethics training",
    points: 25,
    description: "Pass the peer crisis protocol assessment.",
    track: "advocacy" as const,
    active: true,
  },
];

const DEFAULT_PODS = [
  {
    name: "Growth Pod",
    slug: "growth",
    kind: "growth" as const,
    description:
      "Referrals, outreach, campus acquisition and partnerships. Getting Xolace to the people who need it.",
    active: true,
  },
  {
    name: "Community Pod",
    slug: "community",
    kind: "community" as const,
    description:
      "Conversations, campus engagement, mental-health awareness and events. Making a room feel safer.",
    active: true,
  },
  {
    name: "Production Pod",
    slug: "production",
    kind: "production" as const,
    description:
      "Films, campaigns and photography. Turning what people feel into something watchable.",
    active: true,
  },
];

const DAY = 24 * 60 * 60 * 1000;

// `actionKey` ties a mission to a `pointActions` row. `points` is snapshotted
// here rather than joined at read time, so raising an action's value later
// never changes what an ambassador already earned on this mission.
const DEFAULT_MISSIONS = [
  {
    slug: "start-a-conversation",
    title: "Start a Conversation",
    summary:
      "Start a meaningful conversation around something people don't usually talk about.",
    description:
      "Pick a topic your campus genuinely avoids — money, family pressure, grief, loneliness, the thing someone hinted at last week and then changed the subject.\n\nYou are not fixing anyone. You are the person who goes first so that everyone else knows it is safe to answer. That is the whole job.\n\nWhat to do:\n1. Pick one avoided subject and say plainly that you want to talk about it.\n2. Give people a way to respond that is not putting themselves on camera — anonymous notes, a shared doc, a voice note.\n3. Stay for the whole conversation. Do not summarise it afterwards or turn it into content without asking.\n4. Submit how many people took part and what came up.\n\nIf someone discloses something serious, follow the escalation protocol rather than handling it yourself.",
    track: "community" as const,
    actionKey: "host_activity",
    points: 50,
    difficulty: "beginner" as const,
    startsInDays: -2,
    endsInDays: 12,
  },
  {
    slug: "tell-a-story",
    title: "Tell a Story",
    summary:
      "Create a short piece of content that helps someone feel understood.",
    description:
      "Make something small — a 30-second video, a photo set, three lines of a poem, a voice note over a rainy window.\n\nThe only test is whether someone who watches it feels slightly less alone. Views are not the measure. Save-one is not the measure.\n\nWhat to do:\n1. Pick one feeling and make something honest about it.\n2. Do not use anyone's story — including your own — without their explicit permission.\n3. Do not promise that Xolace replaces therapy, and do not imply it.\n4. Submit the link plus one sentence on what you were trying to reach.\n\nContent that misrepresents the app, or that pressures anyone into downloading it, will be rejected.",
    track: "creator" as const,
    actionKey: "create_content",
    points: 20,
    difficulty: "intermediate" as const,
    startsInDays: -2,
    endsInDays: 16,
  },
  {
    slug: "the-things-we-dont-say",
    title: "The Things We Don't Say",
    summary:
      "Run this month's campaign and collect honest answers, anonymously.",
    description:
      "This month's campaign asks one question: what's something you've wanted to say but haven't?\n\nAsk it anonymously. Collect the responses. Send them to the team — that is the deliverable, not a social post.\n\nWhat to do:\n1. Use the campaign wording and assets exactly as supplied — the framing is deliberate.\n2. Collect responses somewhere that is genuinely anonymous. Do not ask for names alongside answers.\n3. Forward the raw responses to the team. We turn them into product insight, which is why they matter.\n4. Submit your reach and the number of responses.\n\nDo not select, edit or publish responses without permission from the people who wrote them.",
    track: "growth" as const,
    actionKey: "share_campaign",
    points: 5,
    difficulty: "beginner" as const,
    startsInDays: -1,
    endsInDays: 9,
  },
  {
    slug: "make-emotion-easier-to-talk-about",
    title: "Make Emotion Easier to Talk About",
    summary:
      "Design something that lowers the cost of starting a conversation.",
    description:
      "The hardest part of talking about feelings is the first sentence. Design something that makes that first sentence easier.\n\nA good submission is one of:\n• A poster or card series for a campus noticeboard\n• A set of conversation prompts for a hostel or dining hall\n• An animated loop for a screen people wait around for\n• A wayfinding or signage concept for a campus event\n\nWhat to do:\n1. Pick a real physical space where people already feel stuck.\n2. Design for that specific moment. Generic inspiration quotes do not count.\n3. Submit the concept at any stage — rough is fine. A sketch with a clear idea beats a polished render with none.",
    track: "creative" as const,
    actionKey: "create_campaign_concept",
    points: 40,
    difficulty: "intermediate" as const,
    startsInDays: -4,
    endsInDays: 20,
  },
  {
    slug: "shoot-the-conversation",
    title: "Shoot the Conversation",
    summary:
      "Film a short, real conversation. No script, no staging, no acting.",
    description:
      "Two people. One honest question. A real answer. Ninety seconds maximum.\n\nWhat makes this work:\n• A real question, asked naturally. Not read off a card.\n• Real answers. If someone says \"I don't know\", that's the footage.\n• Ambient sound over a backing track. Room noise is not a flaw.\n• Consent on camera, and a name you can credit only if they want it.\n\nBefore you shoot, read the interview consent note in Resources. It is not optional.\n\nSubmit the footage and the consent confirmations. Anything without consent is discarded and is not eligible for points.",
    track: "production" as const,
    actionKey: "produce_video",
    points: 50,
    difficulty: "advanced" as const,
    startsInDays: -6,
    endsInDays: 24,
  },
];

export const applyDefaults = internalMutation({
  args: {},
  handler: async (ctx) => {
    const levelIds = [];
    for (const level of DEFAULT_LEVELS) {
      const existing = await ctx.db
        .query("levels")
        .withIndex("by_rank", (q) => q.eq("rank", level.rank))
        .unique();

      levelIds.push(
        existing === null ? await ctx.db.insert("levels", level) : existing._id,
      );
    }

    const actionIds = [];
    for (const action of DEFAULT_POINT_ACTIONS) {
      const existing = await ctx.db
        .query("pointActions")
        .withIndex("by_key", (q) => q.eq("key", action.key))
        .unique();

      actionIds.push(
        existing === null
          ? await ctx.db.insert("pointActions", action)
          : existing._id,
      );
    }

    for (const pod of DEFAULT_PODS) {
      const existing = await ctx.db
        .query("pods")
        .withIndex("by_slug", (q) => q.eq("slug", pod.slug))
        .unique();

      if (existing === null) {
        await ctx.db.insert("pods", pod);
      }
    }

    return {
      levels: levelIds.length,
      pointActions: actionIds.length,
      pods: DEFAULT_PODS.length,
    };
  },
});

// Separate from `applyDefaults` so re-seeding configuration never resurrects a
// mission an admin has closed. Keyed off the title, which admins do not edit,
// so this is safe to re-run.
export const applyMissionDefaults = internalMutation({
  args: { createdBy: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();

    let created = 0;

    for (const seed of DEFAULT_MISSIONS) {
      const existing = await ctx.db
        .query("missions")
        .withIndex("by_title", (q) => q.eq("title", seed.title))
        .unique();

      if (existing !== null) {
        continue;
      }

      await ctx.db.insert("missions", {
        title: seed.title,
        slug: seed.slug,
        summary: seed.summary,
        description: seed.description,
        track: seed.track,
        actionKey: seed.actionKey,
        points: seed.points,
        difficulty: seed.difficulty,
        status: "published",
        startsAt: now + seed.startsInDays * DAY,
        endsAt: now + seed.endsInDays * DAY,
        createdBy: args.createdBy,
      });

      created++;
    }

    return { created };
  },
});

export const setLevelThreshold = internalMutation({
  args: { key: v.string(), minPoints: v.number() },
  handler: async (ctx, args) => {
    const level = await ctx.db
      .query("levels")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (level === null) {
      throw new Error(
        `No level with key ${args.key}. Run applyDefaults first.`,
      );
    }

    await ctx.db.patch(level._id, { minPoints: args.minPoints });
    return level._id;
  },
});
