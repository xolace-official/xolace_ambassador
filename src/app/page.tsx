"use client";

import AmbassadorStories from "@/components/ambassador/ambassador-stories";
import Benefits from "@/components/ambassador/benefits";
import FirstMission from "@/components/ambassador/first-mission";
import HeroSection from "@/components/ambassador/hero-section";
import HowItWorks from "@/components/ambassador/how-it-works";
import Impact from "@/components/ambassador/impact";
import JoinProgramForm from "@/components/ambassador/join-program";
import Safety from "@/components/ambassador/safety";
import Tracks from "@/components/ambassador/tracks";
import WhyAmbassadors from "@/components/ambassador/why-ambassadors";

export default function Home() {
  return (
    <main
      className={
        "flex items-start justify-start w-full min-h-screen bg-background text-foreground"
      }
    >
      <div className="flex items-start justify-start w-full flex-col bg-background">
        <HeroSection />
        <WhyAmbassadors />
        <Tracks />
        <HowItWorks />
        <Benefits />
        <AmbassadorStories />
        <Impact />
        <FirstMission />
        <Safety />
        <JoinProgramForm />
      </div>
    </main>
  );
}
