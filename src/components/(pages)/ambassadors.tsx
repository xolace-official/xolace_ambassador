import { OFFICIAL_AMBASSADORS } from "@/constants";
import AmbassadorCard from "../ambassador-showcase/ambassador-card";
import AnimatedCta from "../ambassador-showcase/animated-cta";
import AnimatedHero from "../ambassador-showcase/animated-hero";

const Ambassadors = () => {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedHero />

      {/* Ambassadors Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {OFFICIAL_AMBASSADORS.map((ambassador, index) => (
              <AmbassadorCard
                key={ambassador.id}
                ambassador={ambassador}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <AnimatedCta />
    </div>
  );
};

export default Ambassadors;
