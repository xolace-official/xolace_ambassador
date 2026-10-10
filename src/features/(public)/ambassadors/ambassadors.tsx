"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import AmbassadorCard from "../landing/components/ambassador-showcase/ambassador-card";
import AnimatedCta from "../landing/components/ambassador-showcase/animated-cta";
import AnimatedHero from "../landing/components/ambassador-showcase/animated-hero";

const PAGE_SIZE = 8;
// The query caps at 48, so this ceiling keeps the button honest once the last
// page is showing rather than looping on an empty fetch.
const MAX_SHOWN = 48;

const Ambassadors = () => {
  const ambassadors = useQuery(api.publicAmbassadors.list, {
    limit: MAX_SHOWN,
  });
  const [visible, setVisible] = useState(PAGE_SIZE);

  const all = ambassadors ?? [];
  const shown = all.slice(0, visible);
  const hasMore = all.length > shown.length;

  return (
    <div className="min-h-screen bg-background">
      <AnimatedHero />

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {ambassadors === undefined ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : all.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {shown.map((ambassador, index) => (
                  <AmbassadorCard
                    key={ambassador.id}
                    ambassador={ambassador}
                    index={index}
                  />
                ))}
              </div>

              {hasMore ? (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisible((count) => count + PAGE_SIZE)}
                    className="inline-flex min-h-11 items-center rounded-full border border-border bg-background px-8 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Load more ambassadors
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <p className="rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
              Our ambassadors are being onboarded. Check back shortly.
            </p>
          )}
        </div>
      </section>

      <AnimatedCta />
    </div>
  );
};

export default Ambassadors;
