"use client";

import { useConvexAuth } from "@convex-dev/auth/react";
import { ArrowLeft, Bell, Menu, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";
import { allDestinations } from "@/components/layout/menu";
import { Button } from "@/components/ui/button";
import type { PortalRole } from "@/types/portal.type";

interface TopBarProps {
  onMenuClick: () => void;
}

const subscribeNever = () => () => {};

function toggleThemeWithTransition(
  origin: Element,
  next: string,
  setTheme: (theme: string) => void,
) {
  const rect = origin.getBoundingClientRect();
  document.documentElement.style.setProperty(
    "--theme-toggle-x",
    `${rect.left + rect.width / 2}px`,
  );
  document.documentElement.style.setProperty(
    "--theme-toggle-y",
    `${rect.top + rect.height / 2}px`,
  );

  if (typeof document.startViewTransition !== "function") {
    setTheme(next);
    return;
  }
  document.startViewTransition(() => setTheme(next));
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { isAuthenticated, isLoading } = useConvexAuth();

  const [currentTime, setCurrentTime] = useState(new Date());

  const [, roleSegment, uuid] = pathname.split("/");

  const { resolvedTheme, setTheme } = useTheme();
  // Theme is unknown until after hydration â€” the mounted check avoids a
  // server/client mismatch on the icon shown.
  const themeMounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const isDark = themeMounted && resolvedTheme === "dark";

  // Anything outside the portal has no nav, so it gets no title lookup and no
  // back button rather than a wrong one.
  const role: PortalRole | null =
    roleSegment === "admin" || roleSegment === "ambassador"
      ? roleSegment
      : null;

  const destinations = role ? allDestinations(role, uuid) : [];

  // An exact hit is a page the sidebar links to, so it needs no back button.
  const current = destinations.find((item) => item.href === pathname);

  // A prefix hit is a child page — a mission detail, say. It borrows the
  // parent's title, and back points at the parent rather than at history, which
  // would be a dead end on a direct load.
  const parent = destinations.find((item) =>
    pathname.startsWith(`${item.href}/`),
  );

  const pageTitle = current?.name ?? parent?.name ?? "Dashboard";

  // Keep the displayed time updated.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleProfile() {
    try {
      //await signOut();
      router.push("/profile");
    } catch (error) {
      console.error("Navigation failed:", error);
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between pe-4 md:p-4">
      <div className="flex items-center gap-2 md:gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted lg:hidden"
        >
          <Menu className="h-[18px] w-[18px] stroke-[1.7]" />
        </Button>

        {parent ? (
          <Button
            asChild
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-full border-border bg-card text-foreground hover:bg-muted"
          >
            <Link href={parent.href} aria-label={`Back to ${parent.name}`}>
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        ) : null}

        {/* The page's single h1 — the content area must not repeat it. */}
        <h1 className="truncate text-sm font-semibold uppercase tracking-wide">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 px-2 sm:flex">
          <span className="text-xs text-muted-foreground">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>

          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />

          <span className="text-xs font-semibold tabular-nums">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(event) => {
            event.preventDefault();
            toggleThemeWithTransition(
              event.currentTarget as Element,
              isDark ? "light" : "dark",
              setTheme,
            );
          }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full text-muted-foreground hover:bg-muted"
        >
          <Bell className="h-[18px] w-[18px] stroke-[1.7]" />

          <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleProfile}
          className="h-9 w-9 rounded-full border border-border bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Profile"
        >
          <User className="h-[17px] w-[17px] stroke-[1.7]" />
        </Button>
      </div>
    </header>
  );
}
