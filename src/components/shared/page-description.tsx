import { cn } from "@/lib/utils";

const descriptions = {
  adminMissions:
    "Manage ambassador activities and contributions, from mission briefs to submitted work and outcomes.",
  adminSubmissions:
    "Review ambassador work and impact reports as they come in.",
  adminImpact:
    "Explore approved contributions that show how ambassadors are making a difference across program tracks.",
  ambassadorMissions:
    "Choose a mission, make your contribution, and grow with Xolace.",
  createMission:
    "Give ambassadors a focused task, a clear brief, and a safe way to make a meaningful contribution.",
} as const;

type PageDescriptionProps = {
  page: keyof typeof descriptions;
  className?: string;
};

export function PageDescription({ page, className }: PageDescriptionProps) {
  return (
    <p className={cn("text-sm leading-6 sm:text-base", className)}>
      {descriptions[page]}
    </p>
  );
}
