"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowUpRight,
  CalendarDays,
  FileCheck2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../../../../convex/_generated/api";

const reviewSchema = z
  .object({
    decision: z.enum(["approved", "rejected", "declined"]),
    reviewNote: z.string().max(4000, "Keep feedback under 4,000 characters."),
  })
  .superRefine(({ decision, reviewNote }, context) => {
    if (decision !== "approved" && reviewNote.trim().length < 10) {
      context.addIssue({
        code: "custom",
        path: ["reviewNote"],
        message: "Add clear feedback so the ambassador knows what to do next.",
      });
    }
  });

type ReviewValues = z.infer<typeof reviewSchema>;

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

const statusLabel = {
  pending: "Submitted",
  approved: "Approved",
  rejected: "Changes requested",
  declined: "Rejected",
} as const;

const statusStyle = {
  pending: "bg-warning text-warning-foreground",
  approved: "bg-success text-success-foreground",
  rejected: "bg-warning text-warning-foreground",
  declined: "bg-destructive text-destructive-foreground",
} as const;

const kindLabel = {
  mission_submission: "Mission submission",
  people_reached: "People reached",
  app_install: "App installs",
  referral: "Referrals",
  content: "Content",
  event: "Event",
  other: "Other contribution",
} as const;

const quantityLabel = {
  mission_submission: "reported",
  people_reached: "people reached",
  app_install: "app installs",
  referral: "referrals",
  content: "items of content",
  event: "events",
  other: "reported",
} as const;

export default function AdminSubmissionDetail({
  submissionId,
  uuid,
}: {
  submissionId: string;
  uuid: string;
}) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const submission = useQuery(api.contributions.adminGet, {
    contributionId: submissionId,
  });
  const reviewContribution = useMutation(api.contributions.adminReview);
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { decision: "approved", reviewNote: "" },
  });
  const decision = watch("decision");

  if (submission === undefined) {
    return (
      <output
        className="block space-y-5"
        aria-label="Loading submission details"
      >
        <div
          aria-hidden="true"
          className="h-32 animate-pulse rounded-xl border border-border bg-card"
        />
        <div
          aria-hidden="true"
          className="h-64 animate-pulse rounded-xl border border-border bg-card"
        />
      </output>
    );
  }

  if (submission === null) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={FileCheck2}
          title="Submission not found"
          description="This contribution may have been removed, or the link may be incorrect."
        />
      </div>
    );
  }

  async function submitReview(values: ReviewValues) {
    if (submission == null) return;

    const reviewNote = values.reviewNote.trim();

    try {
      await reviewContribution({
        contributionId: submission._id,
        status: values.decision,
        reviewNote: reviewNote || undefined,
      });
      toast.success(
        values.decision === "approved"
          ? "Submission approved."
          : values.decision === "rejected"
            ? "Changes requested. Feedback has been saved."
            : "Submission rejected.",
      );
      reset();
      setReviewOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not review this submission. Try again.",
      );
    }
  }

  return (
    <div className="grid w-full gap-5 pb-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:p-7 lg:col-span-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{kindLabel[submission.kind]}</Badge>
            <Badge className={statusStyle[submission.status]}>
              {statusLabel[submission.status]}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
            {submission.missionTitle ?? submission.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <UserRound aria-hidden="true" className="size-4" />
              Submitted by {submission.ambassadorName}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="size-4" />
              {dateTimeFormat.format(new Date(submission._creationTime))}
            </span>
            {submission.missionId ? (
              <Link
                href={`/admin/${uuid}/missions/${submission.missionId}`}
                className="inline-flex min-h-11 items-center gap-1 font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View mission
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>
        {submission.status === "pending" ? (
          <Button
            type="button"
            size="sm"
            className=" w-fit shrink-0 self-end sm:self-auto"
            onClick={() => setReviewOpen(true)}
          >
            Review submission
          </Button>
        ) : null}
      </header>

      <Card className="gap-0 border-border p-5 sm:p-6 lg:col-start-1 lg:row-start-2">
        <h2 className="text-lg font-semibold text-foreground">
          Ambassador response
        </h2>
        {submission.note ? (
          <div className="mt-4 min-w-0 rounded-lg border border-border bg-muted/20 p-4 sm:p-5">
            <h3 className="text-sm font-medium text-foreground">Overview</h3>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-foreground/85">
              {submission.note}
            </p>
          </div>
        ) : null}
        {submission.responses?.length ? (
          <dl className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
            {submission.responses.map((response) => (
              <div
                key={response.fieldKey}
                className="min-w-0 rounded-lg border border-border p-4 sm:p-5"
              >
                <dt className="break-words text-sm font-semibold text-foreground">
                  {response.label}
                </dt>
                <dd className="mt-2 min-w-0 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                  {response.value || "No response provided."}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {submission.quantity !== undefined ? (
          <div className="mt-4 rounded-lg border border-border p-4 sm:p-5">
            <p className="text-sm font-medium text-foreground">
              Reported quantity
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {submission.quantity} {quantityLabel[submission.kind]}
            </p>
          </div>
        ) : null}
        {submission.link ? (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">Evidence</p>
            <a
              href={submission.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex min-h-11 max-w-full items-center gap-1 break-all text-sm text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {submission.link}
              <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
            </a>
          </div>
        ) : null}
        {!submission.note &&
        !submission.responses?.length &&
        submission.quantity === undefined &&
        !submission.link ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No response details were included.
          </p>
        ) : null}
      </Card>

      {submission.status === "pending" ? (
        <Card className="gap-3 border-border p-5 sm:p-6 lg:col-start-2 lg:row-start-2">
          <Badge className="w-fit bg-warning text-warning-foreground">
            Awaiting review
          </Badge>
          <h2 className="text-base font-semibold text-foreground">Next step</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Review the ambassador’s response and evidence, then approve it,
            request changes, or reject the submission.
          </p>
          <p className="border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
            Request changes keeps the mission open for a revised submission.
          </p>
        </Card>
      ) : null}

      {submission.status === "pending" ? (
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent className="inset-x-0 bottom-0 top-auto max-h-[85dvh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto overscroll-contain rounded-b-none rounded-t-2xl p-5 sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6">
            <DialogHeader>
              <DialogTitle>Review submission</DialogTitle>
              <DialogDescription>
                Choose an outcome and leave feedback for the ambassador.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              noValidate
              onSubmit={handleSubmit(submitReview)}
            >
              <div className="space-y-2">
                <span
                  id="review-decision-label"
                  className="text-sm font-medium text-foreground"
                >
                  Decision
                </span>
                <Controller
                  control={control}
                  name="decision"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="review-decision"
                        aria-labelledby="review-decision-label"
                        className="w-full border-border bg-card"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Approve</SelectItem>
                        <SelectItem value="rejected">
                          Request changes
                        </SelectItem>
                        <SelectItem value="declined">
                          Reject submission
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="reviewNote"
                  className="text-sm font-medium text-foreground"
                >
                  Feedback
                  {decision === "approved" ? " (optional)" : " (required)"}
                </label>
                <Textarea
                  id="reviewNote"
                  placeholder="Share feedback or explain the next step…"
                  rows={4}
                  aria-invalid={Boolean(errors.reviewNote)}
                  aria-describedby="reviewNote-help reviewNote-error"
                  {...register("reviewNote")}
                />
                <p
                  id="reviewNote-help"
                  className="text-xs text-muted-foreground"
                >
                  Request changes allows a resubmission. Reject closes this
                  submission without another attempt.
                </p>
                {errors.reviewNote ? (
                  <p
                    id="reviewNote-error"
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {errors.reviewNote.message}
                  </p>
                ) : null}
              </div>
              <DialogFooter className="flex-col-reverse sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setReviewOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving…" : "Save review"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : (
        <Card className="gap-3 border-border p-5 sm:p-6 lg:col-start-2 lg:row-start-2">
          <h2 className="font-semibold text-foreground">Review outcome</h2>
          {submission.reviewNote ? (
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {submission.reviewNote}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No additional feedback was left.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {submission.reviewerName
              ? `Reviewed by ${submission.reviewerName}`
              : "Reviewed"}
            {submission.reviewedAt
              ? ` · ${dateTimeFormat.format(new Date(submission.reviewedAt))}`
              : null}
          </p>
        </Card>
      )}
    </div>
  );
}
