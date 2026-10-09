"use client";

import { useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { api } from "../../../../../../convex/_generated/api";

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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AmbassadorStories() {
  // Newest onboarded first; falls back to all-time order when there are none.
  const recent = useQuery(api.publicAmbassadors.list, {
    order: "recent",
    limit: 3,
  });
  const allTime = useQuery(api.publicAmbassadors.list, {
    order: "points",
    limit: 3,
  });

  const featured = (recent ?? []).length > 0 ? (recent ?? []) : (allTime ?? []);
  const loading = recent === undefined && allTime === undefined;

  return (
    <section
      id="stories"
      className="relative w-full overflow-hidden scroll-mt-20 bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="relative z-10 mx-auto max-w-6xl space-y-8 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-2.5"
        >
          <div className="flex w-full items-center justify-between gap-4 pt-2">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase sm:text-sm">
              Meet the Ambassadors
            </p>
            <Link
              href="/ambassadors"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary transition-[gap] duration-300 hover:gap-2.5"
            >
              Meet all ambassadors
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <h2 className="max-w-3xl text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Real people. Real reasons for showing up.
          </h2>
        </motion.div>

        {loading ? (
          <div className="flex h-48 items-center justify-center sm:h-64">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : featured.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-7"
          >
            {featured.map((ambassador, index) => {
              const stripColor = colorStrips[index % colorStrips.length];

              return (
                <motion.div
                  key={ambassador.id}
                  variants={itemVariants}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div
                    className={`relative h-16 bg-linear-to-br ${stripColor}`}
                  >
                    <div className="absolute bottom-0 left-5 flex size-14 translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-muted shadow-md">
                      {ambassador.image ? (
                        <Image
                          src={ambassador.image}
                          alt={ambassador.name}
                          fill
                          sizes="56px"
                          className="object-cover object-top"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="text-sm font-bold text-muted-foreground"
                        >
                          {initials(ambassador.name)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-2 px-5 pt-9 pb-5">
                    <div>
                      <p className="text-base font-bold leading-snug text-foreground">
                        {ambassador.name}
                      </p>
                      {ambassador.location ? (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {ambassador.location}
                        </p>
                      ) : null}
                    </div>

                    {ambassador.bio ? (
                      <blockquote className="line-clamp-3 border-l-2 border-primary/40 pl-3 text-sm leading-relaxed text-foreground/75 italic">
                        {ambassador.bio}
                      </blockquote>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <p className="rounded-2xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
            Our ambassadors are being onboarded. Check back shortly.
          </p>
        )}
      </div>
    </section>
  );
}
