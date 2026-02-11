import { Users, Globe, Heart, Award } from "lucide-react";

export const STATS = [
  { icon: Users, label: "Active Ambassadors", value: "10+" },
  { icon: Globe, label: "Countries", value: "1" },
  { icon: Heart, label: "Lives Impacted", value: "100+" },
  { icon: Award, label: "Events Hosted", value: "2+" },
];

export const OFFICIAL_AMBASSADORS = [
  {
    id: 1,
    name: "Odoom Christopher Abueny",
    role: "Campus Ambassador",
    location: "Koforidua, Ghana",
    image:
      "https://qdjrwasidlmgqxakdxkl.supabase.co/storage/v1/object/public/amabassadors/chris.jpeg",
    bio: "University student dedicated to breaking mental health stigma on campus. Building safe spaces for open conversations.",
    impact: {
      peopleReached: "20+",
      eventsHosted: 0,
      communitiesServed: 1,
    },
    social: {
      linkedin: "https://linkedin.com/in/oachristhedev/",
      twitter: undefined,
      instagram: "https://www.instagram.com/oachristhedev",
      tiktok: undefined,
      github: "https://github.com/oachristhedev"
    },
    joinedDate: "February 2026",
    new: false,
    roles: ["Web Developer", "UI/UX Designer"]
  },
  {
    id: 2,
    name: "Minikon Terry Boso",
    role: "Campus Ambassador",
    location: "Koforidua, Ghana",
    image:
      "https://qdjrwasidlmgqxakdxkl.supabase.co/storage/v1/object/public/amabassadors/Minikon%20Terry%20Boso.jpeg",
    bio: "University student dedicated to breaking mental health stigma on campus. Building safe spaces for open conversations.",
    impact: {
      peopleReached: "2+",
      eventsHosted: 0,
      communitiesServed: 1,
    },
    social: {
      linkedin: undefined,
      twitter: undefined,
      instagram: undefined,
    },
    joinedDate: "February 2026",
    new: true,
  },
    {
    id: 3,
    name: "Antwi Richard Yeboah",
    role: "Campus Ambassador",
    location: "Koforidua, Ghana",
    image:
      "https://qdjrwasidlmgqxakdxkl.supabase.co/storage/v1/object/public/amabassadors/Antwi%20Richard%20Yeboah.jpeg",
    bio: "University student dedicated to breaking mental health stigma on campus. Building safe spaces for open conversations.",
    impact: {
      peopleReached: "2+",
      eventsHosted: 0,
      communitiesServed: 1,
    },
    social: {
      linkedin: undefined,
      twitter: undefined,
      instagram: undefined,
      tiktok: "https://www.tiktok.com/@grannys_son1"
    },
    joinedDate: "February 2026",
    new: true,
  },
     {
    id: 4,
    name: "Boateng Ernest",
    role: "Campus Ambassador",
    location: "Koforidua, Ghana",
    image:
      "https://qdjrwasidlmgqxakdxkl.supabase.co/storage/v1/object/public/amabassadors/Boateng%20Ernest.jpeg",
    bio: "University student dedicated to breaking mental health stigma on campus. Building safe spaces for open conversations.",
    impact: {
      peopleReached: "2+",
      eventsHosted: 0,
      communitiesServed: 1,
    },
    social: {
      linkedin: undefined,
      twitter: undefined,
      instagram: undefined,
      tiktok: undefined
    },
    joinedDate: "February 2026",
    new: true,
  },
];
