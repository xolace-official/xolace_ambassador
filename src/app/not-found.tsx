import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist or has moved.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-background px-4 text-center text-foreground">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        404
      </p>

      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        This page doesn&apos;t exist
      </h1>

      <p className="max-w-md text-sm text-muted-foreground sm:text-base">
        The link may be out of date, or the page may have moved. If you were
        looking for your portal, sign in to pick up where you left off.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>

        <Button asChild variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </main>
  );
}
