import type { Metadata } from "next";

import AdminResources from "@/features/(protected)/admin/resources/pages/admin-resources";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Resources",
  description:
    "Brand kit, templates, campaign assets, videos and guides for ambassadors.",
});

export default function Page() {
  return <AdminResources />;
}
