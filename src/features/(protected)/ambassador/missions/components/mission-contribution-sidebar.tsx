import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Mission, MissionSubmissionField } from "@/types/missions.type";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { MissionSubmitDialog } from "./mission-submit-dialog";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function progressMessage(status: Mission["status"]): string {
  switch (status) {
    case "submitted":
    case "under_review":
      return "Your contribution is with the team for review.";
    case "approved":
      return "Your contribution was approved. The points are yours.";
    case "rejected":
      return "Your mission lead left feedback. Update your work and send it again.";
    case "declined":
      return "This submission was declined and cannot be resubmitted.";
    case "in_progress":
      return "You’ve started this mission. Come back when you’re ready to share your work.";
    case "expired":
      return "This mission has closed. Choose an available mission to keep contributing.";
    default:
      return "Review the brief and safety guidance before you get started.";
  }
}

export function MissionContributionSidebar({
  mission,
  missionId,
  canSubmit,
  remaining,
  submissionFields,
  reviewNote,
}: {
  mission: Mission;
  missionId: Id<"missions">;
  canSubmit: boolean;
  remaining: string;
  submissionFields?: MissionSubmissionField[];
  reviewNote?: string;
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-4">
      <Card className="gap-0 border-border p-5">
        <p className="text-sm font-medium text-muted-foreground">
          Your contribution
        </p>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
            {mission.points}
          </span>
          <span className="pb-1 text-sm text-muted-foreground">
            impact points
          </span>
        </div>
        <div className="my-5 h-px bg-border" />
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CalendarDays aria-hidden="true" className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Mission deadline
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {dateFormat.format(new Date(mission.endsAt))}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Clock3 aria-hidden="true" className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Time to contribute
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{remaining}</p>
          </div>
        </div>
        <div className="mt-6">
          {canSubmit ? (
            <MissionSubmitDialog
              missionId={missionId}
              missionTitle={mission.title}
              submissionFields={submissionFields}
              label={
                mission.status === "rejected"
                  ? "Resubmit contribution"
                  : "Submit your contribution"
              }
            />
          ) : (
            <div className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm font-medium text-foreground">
              <CheckCircle2 aria-hidden="true" className="size-4" />
              {mission.status === "approved"
                ? "Mission completed"
                : mission.status === "submitted" ||
                    mission.status === "under_review"
                  ? "Contribution under review"
                  : "Mission closed"}
            </div>
          )}
        </div>
      </Card>

      <Card className="gap-3 border-border bg-muted/40 p-5">
        <Badge
          variant="outline"
          className="w-fit border-border text-muted-foreground"
        >
          YOUR PROGRESS
        </Badge>
        <p className="text-sm leading-6 text-foreground/80">
          {progressMessage(mission.status)}
        </p>
        {(mission.status === "rejected" || mission.status === "declined") &&
        reviewNote ? (
          <div className="border-t border-border pt-3">
            <p className="text-sm font-medium text-foreground">
              Feedback from your mission lead
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {reviewNote}
            </p>
          </div>
        ) : null}
      </Card>
    </aside>
  );
}
