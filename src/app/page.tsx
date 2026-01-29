'use client';

import HeroSection from '@/components/ambassador/hero-section';
import JoinProgramForm from '@/components/ambassador/join-program';
import ProgramDetails from '@/components/ambassador/program-details';
import Benefits from '@/components/ambassador/benefits';
import Footer from '@/components/ambassador/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <JoinProgramForm />
      <ProgramDetails />
      <Benefits />
      <Footer />
    </div>
  );
}
