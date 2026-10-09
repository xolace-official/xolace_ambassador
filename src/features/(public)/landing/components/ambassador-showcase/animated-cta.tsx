"use client";

import { useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";
import ImagePreview from "@/components/ui/image-preview";
import { api } from "../../../../../../convex/_generated/api";

const CLUSTER_SIZE = 5;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const AnimatedCta = () => {
  // All-time leaderboard order. Only ambassadors with a totals row can rank, so
  // top up with the newest onboarded rather than showing a short cluster.
  const leaderboard = useQuery(api.publicAmbassadors.list, {
    order: "points",
    limit: CLUSTER_SIZE,
  });
  const newest = useQuery(api.publicAmbassadors.list, {
    order: "recent",
    limit: CLUSTER_SIZE,
  });

  const cluster = useMemo(() => {
    const seen = new Set<string>();
    return [...(leaderboard ?? []), ...(newest ?? [])]
      .filter((ambassador) => {
        if (seen.has(ambassador.id)) return false;
        seen.add(ambassador.id);
        return true;
      })
      .slice(0, CLUSTER_SIZE);
  }, [leaderboard, newest]);

  return (
    <section className="border-t border-border bg-card px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {cluster.length > 0 ? (
            <div className="mb-6 flex justify-center">
              {cluster.map((ambassador, index) => (
                <div
                  key={ambassador.id}
                  style={{
                    marginLeft: index === 0 ? 0 : -14,
                    zIndex: CLUSTER_SIZE - index,
                  }}
                  className="relative flex size-11 items-center justify-center overflow-hidden rounded-full border-[3px] border-card bg-muted"
                >
                  {ambassador.image ? (
                    <ImagePreview
                      src={ambassador.image}
                      alt={ambassador.name}
                      fill
                      sizes="44px"
                      className="object-cover object-top"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="text-[10px] font-bold text-muted-foreground"
                    >
                      {initials(ambassador.name)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          <h2 className="mb-4 text-3xl font-bold text-balance text-foreground sm:text-4xl">
            Want to Join Our Ambassador Program?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Be part of a global movement making mental health support accessible
            to everyone.
          </p>
          <Link
            href="/#apply"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 font-semibold text-accent-foreground shadow-lg transition-colors duration-300 hover:bg-accent/90 hover:shadow-xl"
          >
            Apply Now
            <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default AnimatedCta;
