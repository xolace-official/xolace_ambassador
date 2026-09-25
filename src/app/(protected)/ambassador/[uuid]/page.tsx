import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Ambassador Portal",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  redirect(`/ambassador/${uuid}/dashboard`);
}
