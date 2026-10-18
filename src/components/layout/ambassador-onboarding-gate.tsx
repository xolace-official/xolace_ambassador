"use client";

import { useMutation } from "convex/react";
import { CheckCircle2, Circle, PartyPopper } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PortalSettings } from "@/features/(protected)/shared/settings/pages/portal-settings";
import {
  MISSION_CATEGORIES,
  MISSION_CATEGORY_LABELS,
  type MissionCategory,
} from "@/types/missions.type";
import { api } from "../../../convex/_generated/api";

type Requirements = {
  image: boolean;
  location: boolean;
  school: boolean;
  bio: boolean;
  track: MissionCategory | null;
  safety: boolean;
};

export function AmbassadorOnboardingGate({
  requirements,
  complete,
  children,
}: {
  requirements: Requirements;
  complete: boolean;
  children: React.ReactNode;
}) {
  const wasIncomplete = useRef(!complete);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const claimProfileCompletionReward = useMutation(
    api.settings.claimProfileCompletionReward,
  );
  const chooseTrack = useMutation(api.settings.chooseTrack);
  const [selectedTrack, setSelectedTrack] = useState<MissionCategory | "">(
    requirements.track ?? "",
  );
  const [savingTrack, setSavingTrack] = useState(false);

  useEffect(() => {
    if (!complete || !wasIncomplete.current) return;
    wasIncomplete.current = false;
    void claimProfileCompletionReward()
      .catch(() => null)
      .finally(() => setShowSuccess(true));
  }, [claimProfileCompletionReward, complete]);

  const profileComplete =
    requirements.image &&
    requirements.location &&
    requirements.school &&
    requirements.bio;
  const steps = [
    {
      label: "Profile details",
      done: profileComplete,
      description: "Add your image, location, school and bio.",
    },
    {
      label: "Your track",
      done: Boolean(requirements.track),
      description: "Your program track must be assigned.",
    },
    {
      label: "Safety commitment",
      done: requirements.safety,
      description: "Acknowledge the ambassador guidance.",
    },
  ];

  return (
    <>
      <div className={!complete ? "blur-sm" : undefined}>{children}</div>
      {!complete || showSuccess ? (
        <div className="fixed inset-0 z-modal flex items-end justify-center bg-foreground/35 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <Card className="max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-border bg-background p-5 shadow-xl sm:p-7">
            {showSuccess ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
                  <PartyPopper aria-hidden="true" className="size-8" />
                </span>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                    Congratulations!
                  </h1>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Your ambassador profile is complete. You’ve earned 25 points
                    to start your journey.
                  </p>
                </div>
                <Button type="button" onClick={() => setShowSuccess(false)}>
                  Continue to your portal
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                    Welcome
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Complete your profile to continue.
                  </p>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {steps.map((step, index) => (
                    <button
                      key={step.label}
                      type="button"
                      disabled={steps
                        .slice(0, index)
                        .some((previousStep) => !previousStep.done)}
                      onClick={() => setCurrentStep(index)}
                      className={`rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${currentStep === index ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {step.done ? (
                          <CheckCircle2
                            aria-hidden="true"
                            className="size-4 text-success"
                          />
                        ) : (
                          <Circle
                            aria-hidden="true"
                            className="size-4 text-muted-foreground"
                          />
                        )}
                        {step.label}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {step.description}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="mt-5">
                  {currentStep === 0 ? (
                    <PortalSettings
                      profileEdit
                      onboarding
                      onboardingStep="profile"
                    />
                  ) : currentStep === 1 ? (
                    <div className="grid gap-2 p-4 sm:p-6">
                      <label
                        htmlFor="onboarding-track"
                        className="text-sm font-medium text-foreground"
                      >
                        Track
                      </label>
                      {requirements.track ? (
                        <div className="flex h-9 items-center rounded-md border border-input px-3 text-sm text-foreground">
                          {MISSION_CATEGORY_LABELS[requirements.track]}
                        </div>
                      ) : (
                        <>
                          <Select
                            value={selectedTrack}
                            onValueChange={(value) =>
                              setSelectedTrack(value as MissionCategory)
                            }
                          >
                            <SelectTrigger
                              id="onboarding-track"
                              className="w-full"
                            >
                              <SelectValue placeholder="Select a track" />
                            </SelectTrigger>
                            <SelectContent>
                              {MISSION_CATEGORIES.map((track) => (
                                <SelectItem key={track} value={track}>
                                  {MISSION_CATEGORY_LABELS[track]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            disabled={!selectedTrack || savingTrack}
                            onClick={() => {
                              if (!selectedTrack) return;
                              setSavingTrack(true);
                              void chooseTrack({ track: selectedTrack })
                                .then(() => toast.success("Track saved."))
                                .catch((error) =>
                                  toast.error(
                                    error instanceof Error
                                      ? error.message
                                      : "Could not save your track.",
                                  ),
                                )
                                .finally(() => setSavingTrack(false));
                            }}
                          >
                            {savingTrack ? "Saving…" : "Save track"}
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <PortalSettings
                      profileEdit
                      onboarding
                      onboardingStep="safety"
                    />
                  )}
                </div>
                <div className="mt-5 flex justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep((step) => step - 1)}
                  >
                    Back
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      disabled={!steps[currentStep].done}
                      onClick={() => setCurrentStep((step) => step + 1)}
                    >
                      Continue
                    </Button>
                  ) : null}
                </div>
              </>
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}
