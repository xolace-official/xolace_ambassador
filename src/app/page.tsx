'use client';

import HeroSection from '@/components/ambassador/hero-section';
import JoinProgramForm from '@/components/ambassador/join-program';
import ProgramDetails from '@/components/ambassador/program-details';
import Benefits from '@/components/ambassador/benefits';

export default function Home() {
  return (
    <main className={"flex items-start justify-start w-full min-h-screen bg-background text-foreground"}>
      <div className="flex items-start justify-start w-full flex-col bg-background">
        <HeroSection/>
        <JoinProgramForm/>
        <ProgramDetails/>
        <Benefits/>
      </div>
    </main>
  );
}
