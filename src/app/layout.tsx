import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Nunito, PT_Sans } from "next/font/google";
import Footer from "@/components/ambassador/footer";
import NavBar from "@/components/layout/nav-bar";
import { Providers } from "@/components/providers";
import "./globals.css";

const _nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ambassadors.xolaceinc.com"),
  title: {
    default: "Xolace Ambassadors | Emotional Wellbeing & Community Champions",
    template: "%s | Xolace Ambassadors",
  },
  description:
    "Join the Xolace Ambassador program. Help build a compassionate community where emotional wellbeing is destigmatized and everyone feels heard.",
  keywords: [
    "Xolace",
    "Xolace Ambassadors",
    "Emotional Wellbeing",
    "Mental Health Advocacy",
    "Campus Ambassadors",
    "Youth Community Ghana",
    "Student Leadership",
  ],
  authors: [{ name: "Xolace Inc.", url: "https://xolaceinc.com" }],
  creator: "Xolace Inc.",
  publisher: "Xolace Inc.",
  applicationName: "Xolace Ambassadors",
  icons: {
    icon: "/logo/favicon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ambassadors.xolaceinc.com",
    siteName: "Xolace Ambassadors",
    title: "Xolace Ambassadors | Help Build a World Where People Feel Heard",
    description:
      "Become a Xolace ambassador. Join our movement of creators, community leaders, and advocates fostering safe emotional spaces.",
    images: [
      {
        url: "/why-ambassadors.png",
        width: 1200,
        height: 630,
        alt: "Xolace Ambassador Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xolace Ambassadors | Join the Movement",
    description:
      "Help build a world where people feel heard. Apply to become a Xolace Ambassador today.",
    images: ["/why-ambassadors.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${_nunito.variable} ${ptSans.variable} antialiased`}>
        <Providers>
          <NavBar />
          <main id="main-content">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
