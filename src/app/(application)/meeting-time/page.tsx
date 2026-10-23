import type { Metadata } from "next";
import MeetingTimeSelectionPage from "@/features/(application)/meeting-time/pages/meeting-time-selection-page";

export const metadata: Metadata = {
  title: "Select meeting time",
  description: "Choose a meeting time for your Xolace Ambassador application.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MeetingTimeSelectionPage />;
}
