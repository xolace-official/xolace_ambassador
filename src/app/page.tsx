'use client';

import HeroSection from '@/components/ambassador/hero-section';
import JoinProgramForm from '@/components/ambassador/join-program';
import ProgramDetails from '@/components/ambassador/program-details';
import Benefits from '@/components/ambassador/benefits';
import Footer from '@/components/ambassador/footer';
import NavBar from "@/components/layout/nav-bar";

export default function Home() {
  return (
    <main className={"flex items-start justify-start w-full min-h-screen bg-background text-foreground"}>
      <div className="flex items-start justify-start w-full flex-col ">
        {/*<NavBar/>*/}
        <HeroSection/>
        <JoinProgramForm/>
        <ProgramDetails/>
        <Benefits/>
        {/*<Footer/>*/}
      </div>
    </main>
  );
}
