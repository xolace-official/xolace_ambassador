"use client";

import { Award, CheckCircle2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const peerScenarios = [
  {
    id: 1,
    prompt:
      "A classmate says: 'I feel like I'm working so hard, but nothing seems to change.' How do you respond?",
    options: [
      {
        text: "Just keep grinding, it will pay off eventually!",
        isEmpathetic: false,
        feedback:
          "Dismissive positivity can make people feel unheard. Empathy starts by validating feelings.",
      },
      {
        text: "That sounds really exhausting. It takes a lot of energy to keep trying when you don't see results.",
        isEmpathetic: true,
        feedback:
          "Perfect! You validated their effort and acknowledged their quiet emotional weight.",
      },
      {
        text: "You think you're tired? You should see my schedule!",
        isEmpathetic: false,
        feedback:
          "Shifting the spotlight onto yourself interrupts their sharing moment.",
      },
    ],
  },
];

export default function FirstMission() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [unlockedBadge, setUnlockedBadge] = useState(false);

  const handleSelect = (idx: number, isEmpathetic: boolean) => {
    setSelectedOption(idx);
    if (isEmpathetic) {
      setUnlockedBadge(true);
    }
  };

  return (
    <section
      id="first-mission"
      className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-2xl space-y-4"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wide">
            Your First Mission
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-balance">
            Interactive Empathy Simulator
          </h2>

          <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
            Test your peer listening skills right now. Choose the response that
            makes someone feel truly heard.
          </p>
        </motion.div>

        {/* Interactive Mission Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true, margin: "-50px" }}
          className="rounded-3xl bg-[oklch(0.1649_0.0352_281.8285)] text-white p-6 sm:p-10 shadow-2xl border border-white/10 space-y-8"
        >
          {/* Mission Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider">
                Mission 01 • Interactive Trial
              </span>
              <span className="text-xs text-white/60">Duration: 1 Min</span>
            </div>

            {unlockedBadge ? (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold animate-bounce">
                <Award className="w-4 h-4" /> Ambassador Badge Earned!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/50">
                <Lock className="w-3.5 h-3.5" /> Badge Locked
              </span>
            )}
          </div>

          {/* Scenario Prompt */}
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Scenario Challenge
            </p>
            <p className="text-xl sm:text-2xl font-extrabold leading-snug">
              &ldquo;{peerScenarios[0].prompt}&rdquo;
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {peerScenarios[0].options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={`opt-${idx * 13}`}
                  type="button"
                  onClick={() => handleSelect(idx, option.isEmpathetic)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? option.isEmpathetic
                        ? "bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-900/30"
                        : "bg-rose-950/60 border-rose-500 text-white"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-white/90"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm sm:text-base font-medium">
                      {option.text}
                    </p>
                    {isSelected &&
                      (option.isEmpathetic ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      ))}
                  </div>

                  {isSelected && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`text-xs pt-3 mt-3 border-t ${
                        option.isEmpathetic
                          ? "border-emerald-500/30 text-emerald-200"
                          : "border-rose-500/30 text-rose-200"
                      }`}
                    >
                      {option.feedback}
                    </motion.p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Callout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                That&apos;s how simple empathy begins. Ready for real impact?
              </span>
            </div>
            <a
              href="#apply"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-black font-extrabold hover:bg-white/90 transition-colors shadow-lg"
            >
              Apply as Ambassador
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
