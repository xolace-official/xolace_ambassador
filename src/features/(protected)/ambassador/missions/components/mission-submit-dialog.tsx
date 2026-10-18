"use client";

import { Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { MissionSubmissionField } from "@/types/missions.type";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { MissionSubmissionForm } from "./mission-submission-form";

// A sheet on mobile, a centred modal from `sm` up. The shared Dialog already
// centres itself, so the mobile overrides here neutralise that and slide the
// panel up from the bottom edge instead.
//
// `rounded-none` before `rounded-t-2xl` is deliberate: `rounded-b-none` alone
// would leave the inherited `rounded-2xl` on the left and right corners, which
// looks wrong on a full-width sheet.
const responsivePanel =
  "inset-x-0 bottom-0 top-auto max-w-none translate-x-0 translate-y-0 rounded-none rounded-t-2xl p-0 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95";

export function MissionSubmitDialog({
  missionId,
  missionTitle,
  submissionFields,
  label,
}: {
  missionId: Id<"missions">;
  missionTitle: string;
  submissionFields?: MissionSubmissionField[];
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Send aria-hidden="true" />
          {label}
        </Button>
      </DialogTrigger>

      <DialogContent className={responsivePanel}>
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>
            Share your work for “{missionTitle}”. An admin reviews your
            contribution, and points are added after approval.
          </DialogDescription>
        </DialogHeader>

        {/* `overscroll-contain` stops the page behind scrolling when the form is
            dragged past its end. A single padding class rather than `pb-6` plus
            a safe-area class, because the second would drop the first. */}
        <div className="max-h-[65vh] overflow-y-auto overscroll-contain px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-h-[70vh]">
          <MissionSubmissionForm
            missionId={missionId}
            submissionFields={submissionFields}
            onSubmitted={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
