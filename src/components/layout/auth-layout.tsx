"use client";

import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { currentYear } from "@/features/(public)/landing/components/ambassador/footer";
import { XolaceLogo } from "./xolace-logo";

// `useSearchParams` opts out of static prerendering, so this needs the Suspense
// boundary below or the /login build fails.
function BackToLanding() {
  const searchParams = useSearchParams();
  const router = useRouter();

  if (searchParams.get("from") !== "landing") {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-[color,background-color,border-color] duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5 stroke-[1.8] transition-transform duration-200 group-hover:-translate-x-0.5" />
      <span>Back to Xolace</span>
    </button>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-inverse lg:flex-row">
      <div className="flex flex-col items-center justify-center gap-6 px-8 py-16 text-center lg:w-1/2 lg:py-0"></div>

      <div className="hero-texture flex flex-1 flex-col rounded-t-4xl bg-background px-4 py-8 md:rounded-t-none md:rounded-l-4xl md:px-8">
        <div className="flex shrink-0 items-center justify-between md:px-8">
          <XolaceLogo size="sm" />

          <Suspense fallback={null}>
            <BackToLanding />
          </Suspense>
        </div>

        <div className="flex flex-1 items-center justify-center">
          {children}
        </div>

        <div className="flex shrink-0 items-center justify-between text-sm md:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-between gap-2 font-light text-muted-foreground/30 md:flex-row md:gap-4"
          >
            <p suppressHydrationWarning>Â© {currentYear} Xolace Inc</p>
          </motion.div>

          <div className="flex flex-row gap-2 text-muted-foreground/60">
            <p>Contact Us</p>
            <p>English</p>
          </div>
        </div>
      </div>
    </div>
  );
}
