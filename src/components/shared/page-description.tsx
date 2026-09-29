import { cn } from "@/lib/utils";

const descriptions = {
  adminAmbassadors: "Review applications and manage active ambassadors.",
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
  adminResources:
    "Manage brand kit, templates, campaign assets, videos and guides for ambassadors.",
  adminReports:
    "Program health, ambassador performance, mission outcomes, and exportable data.",
  ambassadorRewards:
    "Track your points, levels, recognition, and the rewards you've earned through your contributions.",
  ambassadorLeaderboard:
    "See how you rank among fellow ambassadors by points, contributions, and impact.",
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
