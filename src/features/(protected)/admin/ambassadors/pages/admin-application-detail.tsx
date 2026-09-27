"use client";

import { useMutation, useQuery } from "convex/react";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MISSION_CATEGORY_LABELS } from "@/types/missions.type";
import { api } from "../../../../../../convex/_generated/api";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function AdminApplicationDetail({
  applicationId,
}: {
  applicationId: string;
}) {
  const [busy, setBusy] = useState(false);
  const application = useQuery(api.applications.adminGet, { applicationId });
  const review = useMutation(api.applications.adminReview);

  async function updateStatus(status: "reviewing" | "accepted" | "rejected") {
    if (status === "rejected" && !window.confirm("Decline this application?")) {
      return;
    }

    setBusy(true);
    try {
      await review({ applicationId, status });
      toast.success(
        status === "reviewing"
          ? "Application marked as reviewing."
          : status === "accepted"
            ? "Application accepted."
            : "Application declined.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update this application.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (application === undefined) {
    return (
      <output className="block space-y-4" aria-label="Loading application">
        <div
          aria-hidden="true"
          className="h-32 animate-pulse rounded-xl bg-card"
        />
        <div
          aria-hidden="true"
          className="h-72 animate-pulse rounded-xl bg-card"
        />
      </output>
    );
  }

  if (application === null) {
    return (
      <EmptyState
        title="Application not found"
        description="This application may have been removed or the link may be incorrect."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-10">
      <header className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
        <div className="min-w-0 space-y-3">
          <Badge className={applicationStatusClass(application.status)}>
            {applicationStatusLabel(application.status)}
          </Badge>
          <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {application.name}
          </h1>
          <a
            href={`mailto:${application.email}`}
            className="inline-flex min-h-11 items-center gap-2 break-all text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {application.email}
            <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
          </a>
        </div>
        {application.status !== "accepted" &&
        application.status !== "rejected" ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {application.status === "new" ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={busy}
                onClick={() => void updateStatus("reviewing")}
              >
                Mark reviewing
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={busy}
              onClick={() => void updateStatus("rejected")}
            >
              Decline
            </Button>
            <Button
              type="button"
              className="min-h-11"
              disabled={busy}
              onClick={() => void updateStatus("accepted")}
            >
              Accept applicant
            </Button>
          </div>
        ) : null}
      </header>

      <Card className="gap-0 border-border p-5 sm:p-7">
        <h2 className="text-lg font-semibold text-foreground">
          Application details
        </h2>
        <dl className="mt-5 grid gap-x-6 sm:grid-cols-2">
          <Detail label="Interested track">
            {MISSION_CATEGORY_LABELS[application.trackInterest]}
          </Detail>
          <Detail label="Location">{application.location}</Detail>
          <Detail label="School or community">
            {application.school || "Not provided"}
          </Detail>
          <Detail label="Social profile">
            {application.socialPlatform && application.socialHandle
              ? `${application.socialPlatform}: ${application.socialHandle}`
              : application.socialHandle || "Not provided"}
          </Detail>
          <Detail label="Applied">
            {dateFormat.format(new Date(application._creationTime))}
          </Detail>
        </dl>
        <div className="mt-5 border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-foreground">Why Xolace?</h3>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
            {application.whyXolace}
          </p>
        </div>
        {application.reviewNote ? (
          <div className="mt-5 border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-foreground">
              Review note
            </h3>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
              {application.reviewNote}
            </p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: string }) {
  return (
    <div className="min-w-0 border-b border-border py-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

function applicationStatusLabel(
  status: "new" | "reviewing" | "accepted" | "rejected",
) {
  return {
    new: "Submitted",
    reviewing: "Reviewing",
    accepted: "Accepted",
    rejected: "Declined",
  }[status];
}

function applicationStatusClass(status: string) {
  if (status === "accepted") return "bg-success text-success-foreground";
  if (status === "rejected") return "bg-muted text-muted-foreground";
  return "bg-warning text-warning-foreground";
}
