import { Analytics } from "@vercel/analytics/next";
import { Nunito, PT_Serif } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";


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
  applicationName: "Xolace Inc",
  icons: {
    apple: "/apple-icon.png",
  },
  creator: "Xolace Inc.",
  publisher: "Xolace Inc.",
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
