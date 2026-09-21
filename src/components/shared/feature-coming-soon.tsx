"use client";

import { Construction, Sparkles } from "lucide-react";

export function FeatureComingSoon({ title = "Feature Coming Soon" }: { title?: string }) {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 font-bold text-3xl text-primary">
      Feature Coming Soon
    </div>
  );
}
