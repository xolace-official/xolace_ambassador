"use client";

import { ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import VoiceSpotlightPlayer from "@/components/ui/voice-spotlight-player";
import { OFFICIAL_AMBASSADORS } from "@/constants";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
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

const colorStrips = [
  "from-primary/90 to-primary/60",
  "from-accent/90 to-accent/60",
  "from-foreground/90 to-foreground/60",
];

function pickThreeRandom<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, 3);
}

export default function AmbassadorStories() {
  const [featuredAmbassadors, setFeaturedAmbassadors] = useState<
    typeof OFFICIAL_AMBASSADORS
  >([]);
  const [isRotating, setIsRotating] = useState(false);

  const shuffleCards = () => {
    setIsRotating(true);
    setFeaturedAmbassadors(pickThreeRandom(OFFICIAL_AMBASSADORS));
    setTimeout(() => setIsRotating(false), 500);
  };

  useEffect(() => {
    setFeaturedAmbassadors(pickThreeRandom(OFFICIAL_AMBASSADORS));
  }, []);

  return (
    <section
      id="stories"
      className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 overflow-hidden"
    >
      <div className="relative z-10 max-w-6xl mx-auto space-y-12 sm:space-y-16">
        {/* Column Stacked Layout: Title Top, Shuffle & Link Row Directly Below */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-2.5 "
          >

            <div className="w-full flex items-center justify-between gap-4 pt-2 border-t border-border/40">
              <p className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wide">
                Meet the Ambassadors
              </p>
              <motion.a
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true, margin: "-50px" }}
                  href="/ambassadors"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-primary hover:gap-2.5 transition-[gap] duration-300"
              >
                Meet all ambassadors
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </motion.a>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight max-w-3xl">
              Real people. Real reasons for showing up.
            </h2>
          </motion.div>

          {/* Row directly below the title */}
          <div className="flex items-center justify-between gap-4 border-t border-border/40">
            {/*<button*/}
            {/*  type="button"*/}
            {/*  onClick={shuffleCards}*/}
            {/*  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95 shadow-xs"*/}
            {/*  title="Shuffle featured ambassadors"*/}
            {/*  aria-label="Shuffle featured ambassadors"*/}
            {/*>*/}
            {/*  <RefreshCw*/}
            {/*    className={`w-3.5 h-3.5 text-primary ${*/}
            {/*      isRotating ? "animate-spin" : ""*/}
            {/*    }`}*/}
            {/*  />*/}
            {/*  Shuffle Cards*/}
            {/*</button>*/}

            {/*<motion.a*/}
            {/*  initial={{ opacity: 0 }}*/}
            {/*  whileInView={{ opacity: 1 }}*/}
            {/*  transition={{ duration: 0.6 }}*/}
            {/*  viewport={{ once: true, margin: "-50px" }}*/}
            {/*  href="/ambassadors"*/}
            {/*  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-primary hover:gap-2.5 transition-[gap] duration-300"*/}
            {/*>*/}
            {/*  Meet all ambassadors*/}
            {/*  <ArrowRight aria-hidden="true" className="w-4 h-4" />*/}
            {/*</motion.a>*/}
          </div>
        </div>

        {/*<motion.div*/}
        {/*  initial={{ opacity: 0, y: 20 }}*/}
        {/*  whileInView={{ opacity: 1, y: 0 }}*/}
        {/*  transition={{ duration: 0.6 }}*/}
        {/*  viewport={{ once: true, margin: "-50px" }}*/}
        {/*>*/}
        {/*  <VoiceSpotlightPlayer />*/}
        {/*</motion.div>*/}

        {featuredAmbassadors.length > 0 ? (
          <motion.div
            key={featuredAmbassadors.map((a) => a.id).join("-")}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-7"
          >
            {featuredAmbassadors.map((ambassador, index) => {
              const trackTag = ambassador.roles?.[0] || ambassador.role;
              const stripColor = colorStrips[index % colorStrips.length];

              return (
                <motion.div
                  key={ambassador.id}
                  variants={itemVariants}
                  className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div
                    className={`relative h-20 bg-linear-to-br ${stripColor}`}
                  >
                    <div className="absolute left-6 -bottom-8 w-16 h-16 rounded-full bg-card border-4 border-card shadow-md overflow-hidden">
                      <Image
                        src={ambassador.image}
                        alt={ambassador.name}
                        fill
                        sizes="64px"
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                  <div className="pt-11 px-6 pb-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-lg text-foreground leading-snug">
                        {ambassador.name}
                      </p>
                    </div>
                    <blockquote className="text-foreground/75 text-sm leading-relaxed italic line-clamp-4">
                      &ldquo;{"I want to help break the stigma around talking about what we carry."}&rdquo;
                    </blockquote>
                    <p className="text-xs font-semibold text-muted-foreground pt-1">
                       {ambassador.location}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </div>
    </section>
  );
}
