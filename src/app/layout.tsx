import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import "./globals.css";
import { ThemedToaster } from "@/components/providers/ThemedToaster";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  icons: {
    icon: "https://res.cloudinary.com/dnucdwa71/image/upload/v1780659221/favicon_rfz0wq.png",
  },
  title: "Xolace Ambassadors | Help Build a World Where People Feel Heard",
  description:
    "Join Xolace Ambassadors on campus and in communities to champion emotional wellbeing, destigmatize mental health, and create safe spaces for authentic human connection.",
  keywords: [
    "Xolace",
    "Xolace Ambassadors",
    "Emotional Wellbeing",
    "Mental Health Support",
    "Campus Advocates",
    "Safe Spaces",
    "Peer Support Ghana",
  ],
  authors: [{ name: "Xolace Inc", url: "https://xolaceinc.com" }],
  creator: "Xolace Inc",
  publisher: "Xolace Inc",
  metadataBase: new URL("https://xolaceinc.com"),
  alternates: {
    canonical: "https://xolaceinc.com/ambassadors",
  },
  openGraph: {
    title: "Xolace Ambassadors | Help Build a World Where People Feel Heard",
    description:
      "Join Xolace Ambassadors on campus and in communities to champion emotional wellbeing and create safe spaces.",
    url: "https://xolaceinc.com/ambassadors",
    siteName: "Xolace Inc",
    images: [
      {
        url: "https://xolaceinc.com/why-ambassadors.png",
        width: 1200,
        height: 630,
        alt: "Xolace Ambassadors Connecting",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xolace Ambassadors | Help Build a World Where People Feel Heard",
    description:
      "Join Xolace Ambassadors to champion emotional wellbeing and create safe spaces.",
    images: ["https://xolaceinc.com/why-ambassadors.png"],
    creator: "@xolaceinc",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // next-themes sets the dark class on <html> from a pre-hydration script, so
    // the server and client markup cannot agree. Without this React logs a
    // hydration mismatch for the class attribute.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased text-foreground bg-background selection:bg-primary/20 selection:text-primary min-h-screen flex flex-col">
        <ThemeProvider>
          <NuqsAdapter>
            <ConvexClientProvider>
              {children}
              <ThemedToaster />
            </ConvexClientProvider>
          </NuqsAdapter>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
