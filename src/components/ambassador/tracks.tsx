"use client";

import {
  Clapperboard,
  HeartHandshake,
  Palette,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const tracks = [
  {
    icon: Video,
    name: "Creator",
    hook: "For people who turn a feeling into something watchable.",
    tags: ["TikTok", "Reels", "Photography", "Storytelling"],
  },
  {
    icon: Users,
    name: "Community",
    hook: "For people who make a room feel a little safer just by showing up.",
    tags: ["Conversations", "Campus events", "Awareness", "Group activities"],
  },
  {
    icon: TrendingUp,
    name: "Growth",
    hook: "For people who know exactly who needs to hear about this.",
    tags: ["Referrals", "Outreach", "Partnerships", "Campus acquisition"],
  },
  {
    icon: Palette,
    name: "Creative",
    hook: "For people who design the thing that makes it easier to talk about.",
    tags: ["Graphic design", "Illustration", "UI/UX", "Campaign concepts"],
  },
  {
    icon: Clapperboard,
    name: "Production",
    hook: "For people who tell stories through a lens.",
    tags: ["Film", "Behind Her Smile", "Campaigns", "Video production"],
  },
  {
    icon: HeartHandshake,
    name: "Advocacy",
    hook: "For people who care about the why, not just the app.",
    tags: ["Mental health awareness", "Peer support", "Education", "Workshops"],
  },
];

export default function Tracks() {
  return (
    <section
      id="tracks"
      className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-2xl space-y-4"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">
            Choose Your Path
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
            You don&apos;t have to be the person who posts flyers.
          </h2>
          <p className="text-lg text-foreground/60 text-balance">
            Every ambassador contributes differently. Pick the track that
            matches how you already show up in the world — you can grow into
            others as you go.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {tracks.map((track, index) => {
            const Icon = track.icon;
            return (
              <motion.div key={track.name} variants={itemVariants}>
                <Card className="relative h-full p-6 bg-card border border-border/30 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-[border-color,box-shadow,transform] duration-300">
                  <span className="absolute top-6 right-6 text-xs font-bold text-foreground/25 tabular-nums">
                    0{index + 1}
                  </span>
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                      <Icon
                        aria-hidden="true"
                        className="w-6 h-6 text-primary"
                      />
                    </div>
                    <h3 className="font-bold text-lg pr-6">{track.name}</h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      {track.hook}
                    </p>
                    <ul className="flex flex-wrap gap-2 pt-1">
                      {track.tags.map((tag) => (
                        <li
                          key={tag}
                          className="text-xs font-medium text-foreground/60 bg-secondary px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center text-foreground/60 text-sm"
        >
          Not sure which one fits? You can shift tracks anytime — most
          ambassadors do.
        </motion.p>
      </div>
    </section>
  );
}
