import { cn } from "@/lib/utils";

const descriptions = {
  adminAmbassadors: "Review applications and manage active ambassadors.",
  adminMeetings:
    "Manage your availability and keep up with the ambassador meetings you have scheduled.",
  adminMeetingsAll:
    "Every scheduled ambassador meeting, across all application statuses.",
  adminMeetingsSlots:
    "Every meeting slot you have created, including booked and disabled ones.",
  adminMissions:
    "Manage ambassador activities and contributions, from mission briefs to submitted work and outcomes.",
  adminSubmissions:
    "Review ambassador work and impact reports as they come in.",
  ambassadorMissions:
    "Choose a mission, make your contribution, and grow with Xolace.",
  ambassadorImpact:
    "Track your contributions, people reached, and the impact you've made through the program.",
  ambassadorResources:
    "Brand kit, templates, campaign assets and guides for representing Xolace.",
  createMission:
    "Give ambassadors a focused task, a clear brief, and a safe way to make a meaningful contribution.",
  createMissionSet:
    "Group missions under one schedule so they become visible together for ambassadors.",
  adminResources:
    "Manage brand kit, templates, campaign assets, videos and guides for ambassadors.",
  adminReports:
    "Program health, ambassador performance, mission outcomes, and exportable data.",
  adminRewards:
    "Create rewards, manage availability, and review ambassador redemption requests.",
  adminAnalytics:
    "Program performance, ambassador engagement, and contribution trends across tracks and levels.",
  adminDashboard:
    "Program-wide overview of ambassadors, missions, impact, and actions waiting on your team.",
  ambassadorDashboard:
    "Your current mission, progress, impact, and the next action waiting for you.",
  ambassadorRewards:
    "Track your points, levels, recognition, and the rewards you've earned through your contributions.",
  ambassadorLeaderboard:
    "See how you rank among fellow ambassadors by points, contributions, and impact.",
  profile:
    "Your identity, program progress, and the impact you are making with Xolace.",
  settings:
    "Manage the profile and account details connected to your ambassador portal.",
} as const;

type PageDescriptionProps = {
  page: keyof typeof descriptions;
  className?: string;
};

export function PageDescription({ page, className }: PageDescriptionProps) {
  return (
    <p className={cn("text-sm leading-6 sm:text-sm", className)}>
      {descriptions[page]}
    </p>
  );
}
