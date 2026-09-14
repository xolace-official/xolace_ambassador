"use client";

import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Lock,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
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
        protocolNotice:
          "Failure to escalate acute crisis endangers life.",
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
    context:
      "Task: Select the strict ethical response regarding peer privacy.",
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

export default function FirstMission() {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [isAssessmentPassed, setIsAssessmentPassed] = useState(false);

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
      className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-3xl space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider border border-rose-500/20">
            <ShieldAlert className="w-4 h-4" /> Ambassador Readiness Test
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-foreground tracking-tight">
            Peer Crisis & Protocol Simulator
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
            Xolace Ambassadors do not guess — they undergo rigorous training.
            Test your readiness through 3 real-world peer protocol stages.
          </p>
        </motion.div>

        {/* Assessment Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true, margin: "-50px" }}
          className="rounded-3xl bg-[oklch(0.14_0.03_280)] text-white p-6 sm:p-10 shadow-2xl border border-white/10 space-y-8"
        >
          {/* Header Bar: Stages Progress */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-extrabold uppercase">
                Stage 0{currentStage.id} of 0{assessmentStages.length}
              </span>
              <span className="text-xs font-semibold text-white/70">
                {currentStage.category}
              </span>
            </div>

            {/* Stage Indicators */}
            <div className="flex items-center gap-2">
              {assessmentStages.map((stg, i) => (
                <div
                  key={stg.id}
                  className={`h-2 rounded-full transition-all ${
                    completedStages.includes(stg.id)
                      ? "w-8 bg-emerald-400"
                      : i === currentStageIdx
                      ? "w-6 bg-amber-400 animate-pulse"
                      : "w-2 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Scenario & Task */}
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {currentStage.title}
            </h3>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                Real Peer Case Scenario
              </p>
              <p className="text-base sm:text-lg font-medium text-white/90 leading-relaxed italic">
                &ldquo;{currentStage.scenario}&rdquo;
              </p>
            </div>

            <p className="text-xs font-semibold text-white/70">
              {currentStage.context}
            </p>
          </div>

          {/* Protocol Response Options */}
          <div className="space-y-3">
            {currentStage.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={`opt-${currentStage.id}-${idx * 17}`}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? option.isCorrect
                        ? "bg-emerald-950/70 border-emerald-400 text-white shadow-lg shadow-emerald-950/50"
                        : "bg-rose-950/70 border-rose-500 text-white shadow-lg shadow-rose-950/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-white/90"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm sm:text-base font-semibold leading-snug">
                      {option.text}
                    </p>
                    {isSelected &&
                      (option.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      ))}
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-white/15 space-y-1"
                    >
                      <p
                        className={`text-xs font-bold ${
                          option.isCorrect
                            ? "text-emerald-300"
                            : "text-rose-300"
                        }`}
                      >
                        {option.feedback}
                      </p>
                      <p className="text-[11px] text-white/60">
                        Notice: {option.protocolNotice}
                      </p>
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action & Certification Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Assessment
            </button>

            {selectedOption !== null &&
              currentStage.options[selectedOption].isCorrect &&
              (currentStageIdx < assessmentStages.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextStage}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-lg hover:scale-105 transition-all"
                >
                  Proceed to Stage 0{currentStageIdx + 2} →
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-black text-sm shadow-xl animate-bounce">
                  <Award className="w-5 h-5" /> Ambassador Protocol Certified!
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
