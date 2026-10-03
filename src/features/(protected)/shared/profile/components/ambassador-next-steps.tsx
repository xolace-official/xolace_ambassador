import type { useQuery } from "convex/react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { api } from "../../../../../../convex/_generated/api";

export function AmbassadorNextSteps({
  profile,
  uuid,
}: {
  profile: NonNullable<
    ReturnType<typeof useQuery<typeof api.ambassadors.getProfile>>
  >;
  uuid: string;
}) {
  const details = profile.profile;
  const steps = [
    {
      label: "Complete your profile",
      complete: Boolean(
        profile.name &&
          profile.image &&
          details?.location &&
          details?.school &&
          details?.bio,
      ),
      href: `settings?section=profile`,
    },
    {
      label: "Complete the safety acknowledgement",
      complete: Boolean(details?.safetyAcknowledgedAt),
      href: `settings?section=program`,
    },
    {
      label: "Explore available missions",
      complete: Boolean(profile.totals?.missionsCompleted),
      href: "missions",
    },
  ];
  const nextStep = steps.find((step) => !step.complete) ?? steps.at(-1);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-foreground">Your next step</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Small, consistent actions help you make a meaningful impact with
              Xolace.
            </p>
          </div>
          <Badge variant="outline">
            {steps.filter((step) => step.complete).length}/{steps.length}{" "}
            complete
          </Badge>
        </div>
        {nextStep ? (
          <Link
            href={`/ambassador/${uuid}/${nextStep.href}`}
            className="mt-5 flex min-h-12 items-center justify-between gap-4 rounded-xl border border-border p-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {steps.indexOf(nextStep) + 1}
              </span>
              <span className="min-w-0 truncate text-sm font-medium text-foreground">
                {nextStep.label}
              </span>
            </span>
            <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
