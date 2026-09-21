"use client";

import AmbassadorStories from "@/features/(public)/landing/components/ambassador/ambassador-stories";
import Benefits from "@/features/(public)/landing/components/ambassador/benefits";
import EmpathyGraphSection from "@/features/(public)/landing/components/ambassador/empathy-graph-section";
import FirstMission from "@/features/(public)/landing/components/ambassador/first-mission";
import HeroSection from "@/features/(public)/landing/components/ambassador/hero-section";
import HowItWorks from "@/features/(public)/landing/components/ambassador/how-it-works";
import Impact from "@/features/(public)/landing/components/ambassador/impact";
import JoinProgramForm from "@/features/(public)/landing/components/ambassador/join-program";
import Safety from "@/features/(public)/landing/components/ambassador/safety";
import Tracks from "@/features/(public)/landing/components/ambassador/tracks";
import WhyAmbassadors from "@/features/(public)/landing/components/ambassador/why-ambassadors";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Xolace Inc.",
  url: "https://ambassadors.xolaceinc.com",
  logo: "https://ambassadors.xolaceinc.com/logo/main-logo.png",
  sameAs: ["https://xolaceinc.com"],
  description:
    "Xolace Ambassadors program builds a compassionate community for emotional wellbeing.",
  member: [
    {
      "@type": "OrganizationRole",
      roleName: "Ambassador Program",
      description: "Youth and campus emotional support advocate program",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex items-start justify-start w-full min-h-screen bg-background text-foreground">
        <div className="flex items-start justify-start w-full flex-col bg-background">
          <HeroSection />
          {/*<EmpathyGraphSection />*/}
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
    </>
  );
}
