import type { useQuery } from "convex/react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { api } from "../../../../../../convex/_generated/api";

export function ProfileCompletionCard({
  completion,
  hasImage,
  profile,
  role,
  uuid,
}: {
  completion: number;
  hasImage: boolean;
  profile: NonNullable<
    ReturnType<typeof useQuery<typeof api.ambassadors.getProfile>>
  >["profile"];
  role: "admin" | "ambassador";
  uuid: string;
}) {
  return (
    <Card className="h-fit">
      <CardContent className="space-y-3 p-3.5 sm:space-y-5 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Profile completeness
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {completion === 100
                ? "Your profile is ready to represent you."
                : hasImage
                  ? "Add a few details so your profile feels complete."
                  : "Add a profile image and a few details so your profile feels complete."}
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {completion}%
          </span>
        </div>
        <Progress value={completion} />
        {completion < 100 ? (
          <Link
            href={`/${role}/${uuid}/profile/edit`}
            className="inline-flex min-h-9 items-center rounded-lg text-xs font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-10 sm:text-sm"
          >
            Complete your profile
          </Link>
        ) : null}
        {role === "ambassador" && profile?.safetyAcknowledgedAt ? (
          <div className="flex items-center gap-2 text-xs text-success sm:text-sm">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            Safety acknowledgement completed
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
