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
      linkedin: "#",
      twitter: "#",
      instagram: "#",
    },
    joinedDate: "February 2026",
    new: true,
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
      linkedin: "#",
      twitter: "#",
      instagram: "#",
    },
    joinedDate: "February 2026",
    new: true,
  },
];
