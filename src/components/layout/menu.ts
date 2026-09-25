export interface MenuItem {
  name: string;
  href: (uuid: string) => string;
  icon: React.ComponentType<{ className?: string }>;
  /** Checked against ROLE_PERMISSIONS in `@/utils/useCanDo`. */
  featureKey: string;
}

import {
  FileText,
  FolderOpen,
  LayoutDashboard,
  LineChart,
  MessageCircle,
  Target,
  Trophy,
  Users,
} from "lucide-react";

export const adminMenu: MenuItem[] = [
  {
    name: "Dashboard",
    // What's happening across the program - active ambassadors, current missions, recent activity, overall impact, pending actions
    href: (u) => `/admin/${u}/dashboard`,
    icon: LayoutDashboard,
    featureKey: "overview",
  },

  {
    name: "Ambassadors",
    // Manage the people running the ambassador program - applications, profiles, tracks, pods, progress, activity
    href: (u) => `/admin/${u}/ambassadors`,
    icon: Users,
    featureKey: "manageAmbassadors",
  },

  {
    name: "Missions",
    // Manage ambassador activities and contributions - create missions, active missions, submissions, reviews, performance
    href: (u) => `/admin/${u}/missions`,
    icon: Target,
    featureKey: "missions",
  },

  {
    name: "Analytics",
    // Understand program performance and impact - activity, reach, referrals, content, events, mission performance
    href: (u) => `/admin/${u}/analytics`,
    icon: LineChart,
    featureKey: "analytics",
  },

  {
    name: "Resources",
    // Manage materials ambassadors use - brand kit, templates, campaign assets, videos, screenshots, guide
    href: (u) => `/admin/${u}/resources`,
    icon: FolderOpen,
    featureKey: "resources",
  },

  {
    name: "Communities",
    // Manage ambassador community spaces - announcements, events, pods, discussions, recognition
    href: (u) => `/admin/${u}/communities`,
    icon: MessageCircle,
    featureKey: "communities",
  },

  {
    name: "Reports",
    // Generate structured program reports - program, ambassador, mission, impact, exports
    href: (u) => `/admin/${u}/reports`,
    icon: FileText,
    featureKey: "reports",
  },
];

export const ambassadorMenu: MenuItem[] = [
  {
    name: "Dashboard",
    // What's happening with me right now - current mission, recent activity, impact summary, announcements, quick actions
    href: (u) => `/ambassador/${u}/dashboard`,
    icon: LayoutDashboard,
    featureKey: "dashboard",
  },

  {
    name: "Missions",
    // Things I can do to contribute to Xolace - available, active, completed, details, submissions
    href: (u) => `/ambassador/${u}/missions`,
    icon: Target,
    featureKey: "missions",
  },

  {
    name: "Impact",
    // What I have contributed and achieved - people reached, referrals, content, activities, contribution history
    href: (u) => `/ambassador/${u}/impact`,
    icon: LineChart,
    featureKey: "impact",
  },

  {
    name: "Resources",
    // Materials I need to represent Xolace - brand kit, templates, campaign assets, videos, screenshots, guide
    href: (u) => `/ambassador/${u}/resources`,
    icon: FolderOpen,
    featureKey: "resources",
  },

  {
    name: "Community",
    // Connect and participate with other ambassadors - announcements, events, pods, discussions, recognition
    href: (u) => `/ambassador/${u}/community`,
    icon: MessageCircle,
    featureKey: "community",
  },

  {
    name: "Rewards",
    // Track recognition and rewards earned from contributions - points, achievements, reward history, recognition
    href: (u) => `/ambassador/${u}/rewards`,
    icon: Trophy,
    featureKey: "rewards",
  },
];
