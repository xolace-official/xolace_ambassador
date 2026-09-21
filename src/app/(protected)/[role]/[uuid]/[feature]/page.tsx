"use client";

import { FeatureComingSoon } from "@/components/shared/feature-coming-soon";

export default function WildcardFeaturePage({ params }: { params: { feature: string } }) {
  // Extract and cleanly format the feature name
  const featureName = params.feature
    ? String(params.feature).replace(/-/g, " ")
    : "Module";

  const title = `${featureName.charAt(0).toUpperCase() + featureName.slice(1)} Coming Soon`;

  return (
    <div className="w-full h-full flex flex-col pt-2 pb-12">
      <FeatureComingSoon title={title} />
    </div>
  );
}
