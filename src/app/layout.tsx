import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono, Nunito, PT_Serif } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const _ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-serif",
});

export const metadata: Metadata = {
  title: "Xolace Ambassador Program | Join Our Mission",
  description:
    "Become a Xolace ambassador and help us bring compassionate mental health support to more people. Join our community of changemakers.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${_nunito.variable} ${_ptSerif.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
