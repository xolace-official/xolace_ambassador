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
      linkedin: "linkedin.com/in/oachristhedev/",
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
      tiktok: "https://www.tiktok.com/@grannys_son1?_r=1&_d=elg1fgl38072e4&sec_uid=MS4wLjABAAAAPkfDHzOCAsGn806Q-O7FXYvarKhlAFg5GShjUOrcRXXpUVDPBe20jcppnndIUyWi&share_author_id=7209262122772055045&sharer_language=en&source=h5_m&u_code=e6m77bbcf4bjm0&item_author_type=1&utm_source=whatsapp&tt_from=whatsapp&enable_checksum=1&utm_medium=ios&share_link_id=71745770-2B58-4FC5-85B4-EC53506C1754&user_id=7209262122772055045&sec_user_id=MS4wLjABAAAAPkfDHzOCAsGn806Q-O7FXYvarKhlAFg5GShjUOrcRXXpUVDPBe20jcppnndIUyWi&social_share_type=5&ug_btm=b8727,b0&utm_campaign=client_share&share_app_id=1233"
    },
    joinedDate: "February 2026",
    new: true,
  },
];
