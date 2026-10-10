"use client";

import { useAction, useQuery } from "convex/react";
import { ExternalLink, UserRound } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MISSION_CATEGORY_LABELS } from "@/types/missions.type";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

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
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineNote, setDeclineNote] = useState("");
  const application = useQuery(api.applications.adminGet, { applicationId });
  const imageUrl = useQuery(
    api.applications.adminGetImageUrl,
    application?.image ? { storageId: application.image } : "skip",
  );
  const accept = useAction(api.applications.adminAccept);
  const scheduleMeeting = useAction(api.applications.adminScheduleMeeting);
  const decline = useAction(api.applications.adminDecline);

  async function scheduleApplicationMeeting() {
    setBusy(true);
    try {
      const emailed = await scheduleMeeting({
        applicationId: applicationId as Id<"applications">,
      });
      if (emailed) {
        toast.success("Meeting scheduled and invitation sent.");
      } else {
        toast.warning(
          "Meeting scheduled, but the invitation email could not be sent.",
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not schedule the meeting.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function declineApplication() {
    setBusy(true);
    try {
      await decline({
        applicationId: applicationId as Id<"applications">,
        note: declineNote,
      });
      setDeclineOpen(false);
      setDeclineNote("");
      toast.success("Decline message sent.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not decline this application.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function acceptApplication() {
    setBusy(true);
    try {
      const emailed = await accept({
        applicationId: applicationId as Id<"applications">,
      });
      setAcceptOpen(false);
      if (emailed) {
        toast.success("Ambassador account created and invitation sent.");
      } else {
        toast.warning(
          "Ambassador account created, but the invitation email could not be sent.",
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not accept this application.",
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
    <div className="mx-auto w-full space-y-5 pb-10">
      <header className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
        <div className="flex min-w-0 items-start gap-4">
          <div className="shrink-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${application.name}'s profile`}
                width={64}
                height={64}
                className="size-16 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full border border-border bg-muted">
                <UserRound
                  aria-hidden="true"
                  className="size-6 text-muted-foreground"
                />
              </div>
            )}
          </div>
          <div className="min-w-0 space-y-2">
            <Badge className={applicationStatusClass(application.status)}>
              {applicationStatusLabel(application.status)}
            </Badge>
            <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {application.name}
            </h1>
            <a
              href={`mailto:${application.email}`}
              className="inline-flex min-h-9 items-center gap-2 break-all text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {application.email}
              <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
            </a>
          </div>
        </div>
        {application.status !== "accepted" &&
        application.status !== "rejected" ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {application.status === "new" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => void scheduleApplicationMeeting()}
              >
                Schedule meeting
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => setDeclineOpen(true)}
            >
              Decline
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={() => setAcceptOpen(true)}
            >
              Accept applicant
            </Button>
          </div>
        ) : null}
      </header>

      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept this application?</DialogTitle>
            <DialogDescription>
              This creates an ambassador account for {application.email},
              generates a referral code, and emails a temporary password. The
              applicant must set a new password before accessing the portal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAcceptOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void acceptApplication()}
              disabled={busy}
            >
              {busy ? "Sending invitation…" : "Accept and send invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline this application?</DialogTitle>
            <DialogDescription>
              Add the feedback that will be sent to {application.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="decline-note" className="text-sm font-medium">
              Feedback
            </label>
            <Textarea
              id="decline-note"
              value={declineNote}
              onChange={(event) => setDeclineNote(event.target.value)}
              placeholder="Share a clear and respectful reason…"
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeclineOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void declineApplication()}
              disabled={busy || declineNote.trim().length < 10}
            >
              {busy ? "Sending…" : "Confirm decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="gap-0 border-border p-5 sm:p-7">
        <h2 className="text-lg font-semibold text-foreground">
          Application details
        </h2>
        <dl className="mt-4 grid gap-x-6 sm:grid-cols-2">
          <Detail label="Interested track">
            {MISSION_CATEGORY_LABELS[application.trackInterest]}
          </Detail>
          <Detail label="Preferred meeting time">
            {application.meetingSlotLabel ?? "Not selected"}
          </Detail>
          <Detail label="Date of birth">
            {application.dateOfBirth
              ? new Intl.DateTimeFormat("en-GB", {
                  dateStyle: "long",
                  timeZone: "UTC",
                }).format(new Date(`${application.dateOfBirth}T00:00:00Z`))
              : "Not provided"}
          </Detail>
          <Detail label="Location">{application.location}</Detail>
          <Detail label="School or community">
            {application.school || "Not provided"}
          </Detail>
          <Detail label="Referral code">
            {application.referralCode || "Not provided"}
          </Detail>
          <Detail label="Social profiles">
            {application.socials && application.socials.length > 0 ? (
              <ul className="mt-1 space-y-1">
                {application.socials.map((s) => (
                  <li key={s.platform} className="flex items-start gap-2">
                    <span className="shrink-0 font-medium text-foreground">
                      {s.platform}:
                    </span>
                    <a
                      href={
                        s.handle.startsWith("http")
                          ? s.handle
                          : `https://${s.handle}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-primary underline-offset-4 hover:underline"
                    >
                      {s.handle}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              "Not provided"
            )}
          </Detail>
          <Detail label="Applied">
            {dateFormat.format(new Date(application._creationTime))}
          </Detail>
        </dl>
        <div className="mt-4 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">Why Xolace?</h3>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
            {application.whyXolace}
          </p>
        </div>
        {application.reviewNote ? (
          <div className="mt-4 border-t border-border pt-4">
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

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 border-b border-border py-2">
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
