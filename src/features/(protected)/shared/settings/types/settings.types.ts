import { z } from "zod";

export const settingsSchema = z.object({
  location: z.string(),
  school: z.string(),
  dateOfBirth: z.string(),
  bio: z.string().max(500, "Keep your bio under 500 characters."),
  tiktok: z.string(),
  instagram: z.string(),
  x: z.string(),
  youtube: z.string(),
  linkedin: z.string(),
  snapchat: z.string(),
});
export type SettingsFormValues = z.infer<typeof settingsSchema>;
export type Settings = {
  role: "admin" | "ambassador";
  name: string | null;
  email: string | null;
  profile: {
    location: string | null;
    school: string | null;
    dateOfBirth: string | null;
    bio: string | null;
    tiktok: string | null;
    instagram: string | null;
    x: string | null;
    youtube: string | null;
    linkedin: string | null;
    snapchat: string | null;
  } | null;
  notificationPreferences: {
    mission: boolean;
    review: boolean;
    reward: boolean;
    resource: boolean;
    community: boolean;
  };
  program: {
    status: "active" | "paused" | "suspended";
    track: string | null;
    podName: string | null;
    referralCode: string | null;
    safetyAcknowledgedAt: number | null;
  } | null;
};

export const emptyValues: SettingsFormValues = {
  location: "",
  school: "",
  dateOfBirth: "",
  bio: "",
  tiktok: "",
  instagram: "",
  x: "",
  youtube: "",
  linkedin: "",
  snapchat: "",
};
