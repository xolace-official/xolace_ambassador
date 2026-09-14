"use client";

import { Pause, Play, Quote, Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface VoiceQuote {
  id: string;
  name: string;
  role: string;
  campus: string;
  quote: string;
  duration: string;
}

const quotes: VoiceQuote[] = [
  {
    id: "1",
    name: "Akosua D.",
    role: "Community Track",
    campus: "UG Legon",
    quote:
      "When someone feels heard for the first time in weeks, you see their shoulders instantly relax. That is why I show up.",
    duration: "0:24",
  },
  {
    id: "2",
    name: "Kofi M.",
    role: "Creator Track",
    campus: "KNUST",
    quote:
      "Creating content isn't just about views. It's about letting a student at 2 AM know they aren't the only one feeling this way.",
    duration: "0:18",
  },
  {
    id: "3",
    name: "Abena S.",
    role: "Advocacy Track",
    campus: "KTU Koforidua",
    quote:
      "Being an ambassador taught me that empathy is a superpower. You don't need a degree to listen with heart.",
    duration: "0:28",
  },
];

export default function VoiceSpotlightPlayer() {
  const [activeQuote, setActiveQuote] = useState<VoiceQuote>(quotes[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full bg-gradient-to-br from-card via-card/95 to-secondary/30 border border-border/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
            <Quote aria-hidden="true" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-foreground leading-snug">
              Voices of Xolace
            </h3>
            <p className="text-xs text-muted-foreground">
              Hear real stories from campus ambassadors
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-bold border border-border/50">
          <Volume2 className="w-3.5 h-3.5 text-primary" /> Audio Spotlight
        </span>
      </div>

      {/* Quote Display */}
      <div className="space-y-4">
        <blockquote className="text-lg sm:text-xl font-medium text-foreground leading-relaxed italic">
          &ldquo;{activeQuote.quote}&rdquo;
        </blockquote>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <div>
            <span className="font-bold text-foreground text-sm block">
              {activeQuote.name}
            </span>
            <span>
              {activeQuote.role} • {activeQuote.campus}
            </span>
          </div>
          <span className="font-mono text-xs font-semibold bg-secondary px-2.5 py-1 rounded-md">
            {activeQuote.duration}
          </span>
        </div>
      </div>

      {/* Waveform Player Bar */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/60 border border-border/50">
        <button
          type="button"
          onClick={togglePlay}
          className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 transition-transform focus-visible:outline-none cursor-pointer"
          aria-label={isPlaying ? "Pause voice quote" : "Play voice quote"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          )}
        </button>

        {/* Animated Sound Wave Graphic */}
        <div className="flex-1 flex items-center gap-1.5 h-8">
          {[40, 65, 30, 85, 95, 45, 70, 30, 90, 60, 75, 40, 80, 50, 95, 35].map(
            (heightPct, idx) => (
              <motion.div
                key={`wave-${activeQuote.id}-${idx * 7}`}
                className={`flex-1 rounded-full transition-colors ${
                  isPlaying ? "bg-primary" : "bg-primary/30"
                }`}
                animate={{
                  height: isPlaying
                    ? [`${heightPct}%`, `${(heightPct * 0.4) % 100}%`, `${heightPct}%`]
                    : `${heightPct * 0.35}%`,
                }}
                transition={{
                  duration: 0.8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: idx * 0.05,
                }}
              />
            ),
          )}
        </div>
      </div>

      {/* Switcher selector pills */}
      <div className="flex flex-wrap gap-2 pt-2">
        {quotes.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              setActiveQuote(q);
              setIsPlaying(true);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeQuote.id === q.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-foreground/70 hover:bg-secondary/80 border border-border/50"
            }`}
          >
            {q.name} ({q.campus})
          </button>
        ))}
      </div>
    </div>
  );
}
