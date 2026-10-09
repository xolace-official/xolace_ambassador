"use client";

import {
  AlertTriangle,
  Award,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { motion } from "motion/react";
import { useQueryState } from "nuqs";
import { createParser } from "nuqs/server";
import { useState } from "react";

interface AssessmentStage {
  id: number;
  title: string;
  category: string;
  scenario: string;
  context: string;
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
    protocolNotice: string;
  }[];
}

const assessmentStages: AssessmentStage[] = [
  {
    id: 1,
    title: "De-escalation & Active Listening Protocol",
    category: "Peer Support Boundary Test",
    scenario:
      "A student walks into your campus node room trembling. They whisper: 'I haven't slept in 4 days. If I fail this exam tomorrow, my family will disown me. I can't keep breathing like this.'",
    context:
      "Task: Choose the protocol response that validates emotion while maintaining safe ambassador boundaries.",
    options: [
      {
        text: "Don't panic! You've studied hard, just get some sleep and you'll easily score an A tomorrow!",
        isCorrect: false,
        feedback:
          "PROTOCOL VIOLATION: Toxic positivity minimizes high emotional distress and invalidates panic.",
        protocolNotice:
          "Ambassadors never dismiss real fear with generic cheerleading.",
      },
      {
        text: "I hear how overwhelming this pressure is right now. Take a deep breath with me. Let's sit together and figure out our next safe step.",
        isCorrect: true,
        feedback:
          "PROTOCOL PASSED: Validated acute distress, grounded the peer, and offered calm presence without over-promising.",
        protocolNotice: "Passed active listening & grounding criteria.",
      },
      {
        text: "Don't worry, I will write the exam summary notes for you tonight so you don't fail.",
        isCorrect: false,
        feedback:
          "PROTOCOL VIOLATION: Over-stepping boundaries into codependency. Ambassadors offer support, not academic proxy work.",
        protocolNotice: "Boundary overflow detected.",
      },
    ],
  },
  {
    id: 2,
    title: "Crisis Triage & Immediate Emergency Referral",
    category: "Safety & Emergency Protocol",
    scenario:
      "During a late-night chat, a peer sends a message implying explicit intent of self-harm within the next hour: 'I can't take this pain anymore. Goodbye everyone.'",
    context:
      "Task: Determine the mandatory emergency response required under Xolace Safety Directives.",
    options: [
      {
        text: "Keep chatting with them privately for hours hoping they change their mind without telling anyone.",
        isCorrect: false,
        feedback:
          "CRITICAL SAFETY VIOLATION: Peer advocates must never carry acute suicide risk alone.",
        protocolNotice: "Failure to escalate acute crisis endangers life.",
      },
      {
        text: "Immediately activate Xolace Emergency Escalation Hotline, inform Campus Mental Health Crisis Lead, and stay on the line.",
        isCorrect: true,
        feedback:
          "PROTOCOL PASSED: Mandatory escalation executed within seconds. Professional crisis team alerted while maintaining connection.",
        protocolNotice: "Emergency Directive 01 successfully triggered.",
      },
      {
        text: "Post on a public campus group asking if anyone knows where the student lives.",
        isCorrect: false,
        feedback:
          "CONFIDENTIALITY VIOLATION: Exposing acute student crisis publicly breaches privacy ethics.",
        protocolNotice: "Privacy violation flagged.",
      },
    ],
  },
  {
    id: 3,
    title: "Confidentiality & Ethical Care Pledge",
    category: "Ambassador Honor Code",
    scenario:
      "A fellow student asks you: 'I heard Kweku was at the Xolace node crying yesterday. What happened to him?'",
    context: "Task: Select the strict ethical response regarding peer privacy.",
    options: [
      {
        text: "Tell them a little bit of what happened, but ask them not to share with others.",
        isCorrect: false,
        feedback:
          "ETHICS VIOLATION: Gossip and leak of peer vulnerability destroys trust across the entire institution.",
        protocolNotice: "Zero tolerance for privacy leaks.",
      },
      {
        text: "State clearly: 'Xolace safe-spaces are strictly confidential. I cannot confirm or discuss anyone's personal story, but Kweku is always welcome here.'",
        isCorrect: true,
        feedback:
          "PROTOCOL PASSED: 100% Zero-Leak Confidentiality upheld. Sacred peer trust preserved.",
        protocolNotice: "Strict Privacy Standard Certified.",
      },
    ],
  },
];

// 1-based for humans, clamped so a hand-edited url can't index past the array.
const parseStage = createParser<number>({
  parse: (value) => {
    const parsed = Number.parseInt(value, 10);
    const index = Number.isNaN(parsed) ? 0 : parsed - 1;
    return Math.min(Math.max(index, 0), assessmentStages.length - 1);
  },
  serialize: (value) => String(value + 1),
  eq: (a, b) => a === b,
});

export default function FirstMission() {
  // The stage lives in the url so a candidate can bookmark or share
  // `?stage=2` and land mid-assessment. `selectedOption` stays local: it is a
  // transient draft answer, not somewhere anyone should be sent.
  const [stageParam, setStageParam] = useQueryState(
    "stage",
    parseStage.withDefault(0),
  );

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [_isAssessmentPassed, setIsAssessmentPassed] = useState(false);

  const currentStageIdx = stageParam;
  const setCurrentStageIdx = (idx: number) => void setStageParam(idx + 1);
  const currentStage = assessmentStages[currentStageIdx];

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    const option = currentStage.options[idx];

    if (option.isCorrect) {
      if (!completedStages.includes(currentStage.id)) {
        const nextCompleted = [...completedStages, currentStage.id];
        setCompletedStages(nextCompleted);

        if (nextCompleted.length === assessmentStages.length) {
          setIsAssessmentPassed(true);
        }
      }
    }
  };

  const handleNextStage = () => {
    if (currentStageIdx < assessmentStages.length - 1) {
      setCurrentStageIdx(currentStageIdx + 1);
      setSelectedOption(null);
    }
  };

  const handleReset = () => {
    setCurrentStageIdx(0);
    setSelectedOption(null);
    setCompletedStages([]);
    setIsAssessmentPassed(false);
  };

  return (
    <section
      id="first-mission"
      className="relative w-full scroll-mt-20 overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-3xl space-y-2"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-bold tracking-wider text-destructive uppercase">
            <ShieldAlert aria-hidden="true" className="size-3.5" />
            Ambassador Readiness Test
          </div>

          <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Peer Crisis &amp; Protocol Simulator
          </h2>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Xolace Ambassadors do not guess &mdash; they undergo rigorous
            training. Test your readiness through 3 real-world peer protocol
            stages.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true, margin: "-50px" }}
          className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-md"
        >
          <div className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {currentStage.category}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Stage {currentStage.id} of {assessmentStages.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5" aria-hidden="true">
              {assessmentStages.map((stg, i) => (
                <div
                  key={stg.id}
                  className={`h-1.5 rounded-full transition-[width,background-color] ${
                    completedStages.includes(stg.id)
                      ? "w-7 bg-success"
                      : i === currentStageIdx
                        ? "w-5 bg-primary"
                        : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="px-5 pt-3">
            <h3 className="text-base font-semibold leading-snug tracking-tight">
              {currentStage.title}
            </h3>
            <p className="pt-1.5 text-sm leading-relaxed text-muted-foreground">
              {currentStage.context}
            </p>
          </div>

          <div className="px-5 pt-3">
            <div className="space-y-1.5 rounded-xl border border-border bg-muted/40 p-3.5">
              <p className="text-[11px] font-bold tracking-wider text-primary uppercase">
                Real peer case scenario
              </p>
              <p className="text-sm leading-relaxed text-foreground/90 italic">
                &ldquo;{currentStage.scenario}&rdquo;
              </p>
            </div>
          </div>

          <div className="grid gap-2 px-5 pt-4 sm:grid-cols-3">
            {currentStage.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={`opt-${currentStage.id}-${idx * 17}`}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`flex w-full cursor-pointer flex-col rounded-xl border p-3.5 text-left transition-[background-color,border-color] sm:p-4 ${
                    isSelected
                      ? option.isCorrect
                        ? "border-success bg-success/10"
                        : "border-destructive bg-destructive/10"
                      : "border-border bg-background hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm leading-snug font-medium">
                      {option.text}
                    </p>
                    {isSelected &&
                      (option.isCorrect ? (
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-0.5 size-5 shrink-0 text-success"
                        />
                      ) : (
                        <AlertTriangle
                          aria-hidden="true"
                          className="mt-0.5 size-5 shrink-0 text-destructive"
                        />
                      ))}
                  </div>

                  {isSelected ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 space-y-1 border-t border-border pt-3"
                    >
                      <p
                        className={`text-xs font-bold ${
                          option.isCorrect ? "text-success" : "text-destructive"
                        }`}
                      >
                        {option.feedback}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Notice: {option.protocolNotice}
                      </p>
                    </motion.div>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-border bg-muted/30 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" /> Reset
              assessment
            </button>

            {selectedOption !== null &&
              currentStage.options[selectedOption].isCorrect &&
              (currentStageIdx < assessmentStages.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextStage}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  Proceed to stage {currentStageIdx + 2}
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-bold text-success-foreground">
                  <Award aria-hidden="true" className="size-4" /> Protocol
                  certified
                </span>
              ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
