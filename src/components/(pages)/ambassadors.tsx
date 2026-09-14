"use client";

import { useEffect, useState } from "react";
import { OFFICIAL_AMBASSADORS } from "@/constants";
import AmbassadorCard from "../ambassador-showcase/ambassador-card";
import AnimatedCta from "../ambassador-showcase/animated-cta";
import AnimatedHero from "../ambassador-showcase/animated-hero";

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const Ambassadors = () => {
  const [ambassadors, setAmbassadors] = useState<typeof OFFICIAL_AMBASSADORS>(
    [],
  );

  useEffect(() => {
    setAmbassadors(shuffleArray(OFFICIAL_AMBASSADORS));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AnimatedHero />

      {/* Ambassadors Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {ambassadors.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {ambassadors.map((ambassador, index) => (
                <AmbassadorCard
                  key={ambassador.id}
                  ambassador={ambassador}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {OFFICIAL_AMBASSADORS.map((ambassador, index) => (
                <AmbassadorCard
                  key={ambassador.id}
                  ambassador={ambassador}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatedCta />
    </div>
  );
};

export default Ambassadors;
