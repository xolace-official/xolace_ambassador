import {
  BarChart3,
  CircleHelp,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LineChart,
  MessageCircle,
  Settings,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { PortalRole } from "@/types/portal.type";

export interface MenuItem {
  name: string;
  href: (uuid: string) => string;
  icon: React.ComponentType<{ className?: string }>;
  /** Checked against ROLE_PERMISSIONS in `@/utils/useCanDo`. */
  featureKey: string;
}

export interface Destination {
  name: string;
  href: string;
}

// Settings and Help sit in the sidebar footer, not the main nav. The topbar
// needs them alongside the main menu to tell a real destination from a child
// page, so they are defined here rather than privately inside the sidebar.
export const UTILITY_MENU = [
  { name: "Settings", slug: "settings", icon: Settings },
  { name: "Help", slug: "help", icon: CircleHelp },
] as const;

export function allDestinations(role: PortalRole, uuid: string): Destination[] {
  const menuItems: MenuItem[] = role === "admin" ? adminMenu : ambassadorMenu;

  return [
    ...menuItems.map((item) => ({ name: item.name, href: item.href(uuid) })),
    ...UTILITY_MENU.map((item) => ({
      name: item.name,
      href: `/${role}/${uuid}/${item.slug}`,
    })),
  ];
}

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
    name: "Leaderboard",
    // See how I rank among fellow ambassadors by points, contributions, and impact
    href: (u) => `/ambassador/${u}/leaderboard`,
    icon: BarChart3,
    featureKey: "leaderboard",
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
