"use client";

import { FeatureComingSoon } from "@/components/shared/feature-coming-soon";

export function DashboardPage() {
    return (
        <div className="w-full h-full flex flex-col pt-2 animate-in fade-in duration-500">
            <FeatureComingSoon />
        </div>
    );
}
