"use client";

import AmbassadorStories from "@/components/ambassador/ambassador-stories";
import Benefits from "@/components/ambassador/benefits";
import EmpathyGraphSection from "@/components/ambassador/empathy-graph-section";
import FirstMission from "@/components/ambassador/first-mission";
import HeroSection from "@/components/ambassador/hero-section";
import HowItWorks from "@/components/ambassador/how-it-works";
import Impact from "@/components/ambassador/impact";
import JoinProgramForm from "@/components/ambassador/join-program";
import Safety from "@/components/ambassador/safety";
import Tracks from "@/components/ambassador/tracks";
import WhyAmbassadors from "@/components/ambassador/why-ambassadors";

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
