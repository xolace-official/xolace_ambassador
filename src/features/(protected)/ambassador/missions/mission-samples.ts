import type { Mission } from "@/types/missions.type";

const day = 24 * 60 * 60 * 1000;
const today = Date.now();

export const missionSamples: Mission[] = [
  {
    id: "start-a-conversation",
    title: "Start a Conversation",
    summary: "Create a welcoming space for a conversation people often avoid.",
    description:
      "Choose a topic your campus or community rarely discusses, such as loneliness, family pressure, or grief. Your role is to make it easier for people to speak, not to solve what they share.\n\nWhat to do:\n1. Choose one topic that feels relevant to your community.\n2. Offer a way to respond without being recorded or identified.\n3. Stay present, listen, and do not share anyone’s story without permission.\n4. Tell us how many people joined and what you learned.\n\nIf someone shares something serious, follow the safety guide and escalation steps. You are not expected to counsel or diagnose anyone.",
    category: "community",
    points: 50,
    difficulty: "beginner",
    startsAt: today - 2 * day,
    endsAt: today + 12 * day,
    status: "available",
  },
  {
    id: "tell-a-story",
    title: "Tell a Story",
    summary: "Make something small that helps someone feel understood.",
    description:
      "Create a short video, photo set, poem, or voice note about one feeling. The goal is to help someone feel less alone, not to chase views.\n\nWhat to do:\n1. Choose one feeling and make something honest about it.\n2. Get clear permission before using another person’s story or image.\n3. Do not suggest that Xolace replaces therapy or professional support.\n4. Share your work and one sentence about the feeling you hoped to reach.",
    category: "creator",
    points: 20,
    difficulty: "intermediate",
    startsAt: today - 2 * day,
    endsAt: today + 16 * day,
    status: "in_progress",
  },
  {
    id: "the-things-we-dont-say",
    title: "The Things We Don’t Say",
    summary: "Collect honest responses to one question, without names.",
    description:
      "Invite people to answer one question anonymously: What is something you have wanted to say but have not? The responses help the team understand what people need.\n\nWhat to do:\n1. Use the supplied campaign wording and materials.\n2. Collect answers in a genuinely anonymous format.\n3. Do not select, edit, or publish responses without permission.\n4. Share the response count and send the unedited responses to the team.",
    category: "growth",
    points: 5,
    difficulty: "beginner",
    startsAt: today - day,
    endsAt: today + 9 * day,
    status: "submitted",
  },
  {
    id: "make-emotion-easier-to-talk-about",
    title: "Make Emotion Easier to Talk About",
    summary: "Design a small prompt that makes starting a conversation easier.",
    description:
      "Create a poster, prompt card, or simple visual for a real place where people gather. Design for the moment someone wants to speak but is unsure how to begin.\n\nWhat to do:\n1. Choose one specific space in your campus or community.\n2. Make a prompt or visual that fits that place.\n3. Share a rough concept or finished design with a note about how it would be used.\n\nDo not use personal stories or identifiable details without permission.",
    category: "creative",
    points: 40,
    difficulty: "intermediate",
    startsAt: today - 4 * day,
    endsAt: today + 20 * day,
    status: "rejected",
  },
  {
    id: "shoot-the-conversation",
    title: "Shoot the Conversation",
    summary: "Film a short, real conversation with everyone’s clear consent.",
    description:
      "Film a short conversation between two people around one thoughtful question. Keep it natural and let participants decide what they are comfortable sharing.\n\nWhat to do:\n1. Read the interview consent guide before filming.\n2. Get permission from everyone before recording and before sharing.\n3. Let participants choose whether their name is credited.\n4. Submit the video and confirm that everyone consented.\n\nAnything recorded or shared without consent cannot be used.",
    category: "production",
    points: 50,
    difficulty: "advanced",
    startsAt: today - 6 * day,
    endsAt: today + 24 * day,
    status: "approved",
  },
  {
    id: "share-the-safety-guide",
    title: "Make Support Easier to Find",
    summary: "Help your community find trusted support and safety resources.",
    description:
      "Create a simple resource guide that points people toward trusted support options in your community. Keep the language clear, respectful, and easy to share.\n\nWhat to do:\n1. Confirm each resource and contact detail before including it.\n2. Explain that ambassadors do not diagnose or provide therapy.\n3. Include appropriate professional or emergency support options.\n4. Share the guide with a short note about where people can find it.",
    category: "advocacy",
    points: 30,
    difficulty: "intermediate",
    startsAt: today - day,
    endsAt: today + 18 * day,
    status: "available",
  },
];

export function getMissionSample(id: string): Mission | undefined {
  return missionSamples.find((mission) => mission.id === id);
}
