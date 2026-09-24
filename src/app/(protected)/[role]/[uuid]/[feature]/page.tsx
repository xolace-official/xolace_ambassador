import { notFound } from "next/navigation";

import AdminAmbassadors from "@/features/(protected)/admin/ambassadors/pages/admin-ambassadors";
import AdminCommunities from "@/features/(protected)/admin/communities/pages/admin-communities";
import AdminDashboard from "@/features/(protected)/admin/dashboard/pages/admin-dashboard";
import AdminResources from "@/features/(protected)/admin/resources/pages/admin-resources";

import AmbassadorDashboard from "@/features/(protected)/ambassador/dashboard/pages/ambassador-dashboard";
import AmbassadorImpact from "@/features/(protected)/ambassador/impact/pages/ambassador-impact";
import AmbassadorCommunity from "@/features/(protected)/ambassador/community/pages/ambassador-community";

const adminFeatures = {
  dashboard: AdminDashboard,
  ambassadors: AdminAmbassadors,
  resources: AdminResources,
  communities: AdminCommunities,
};

const ambassadorFeatures = {
  dashboard: AmbassadorDashboard,
  impact: AmbassadorImpact,
  community: AmbassadorCommunity,
};

const features = {
  admin: adminFeatures,
  ambassador: ambassadorFeatures,
};

export default async function FeaturePage({
  params,
}: {
  params: Promise<{
    role: "admin" | "ambassador";
    uuid: string;
    feature: string;
  }>;
}) {
  const { role, uuid, feature } = await params;

  const featureMap = features[role];

  if (!featureMap) {
    notFound();
  }

  const Feature = featureMap[feature as keyof typeof featureMap];

  if (!Feature) {
    notFound();
  }

  return <Feature />;
}