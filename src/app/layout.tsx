import { Analytics } from "@vercel/analytics/next";
import { Nunito, PT_Sans } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import Footer from "@/components/ambassador/footer";
import NavBar from "@/components/layout/nav-bar";


const _nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
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
        className={`${_nunito.variable} ${ptSans.variable}  antialiased`}
      >
      <NavBar />
      {children}
      <Footer />
      <Analytics />
      </body>
    </html>
  );
}
