import type { Metadata } from "next";
import AdminRewards from "@/features/(protected)/admin/rewards/pages/admin-rewards";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Rewards",
  description: "Manage rewards and ambassador redemption requests.",
});

export default function Page() {
  return <AdminRewards />;
}
