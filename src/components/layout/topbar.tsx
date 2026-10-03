"use client";

import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { ArrowLeft, Bell, Menu, Moon, Sun, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";
import { allDestinations } from "@/components/layout/menu";
import {
  getDemoNotifications,
  NotificationPanel,
} from "@/components/layout/notification-panel";
import { Button } from "@/components/ui/button";
import type { PortalRole } from "@/types/portal.type";
import { api } from "../../../convex/_generated/api";

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
  const user = useQuery(api.users.current);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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

  const role: PortalRole | null =
    roleSegment === "admin" || roleSegment === "ambassador"
      ? roleSegment
      : null;
  const unreadNotificationCount = role
    ? getDemoNotifications(role, uuid).filter(
        (notification) => notification.unread,
      ).length
    : 0;

  const destinations = role ? allDestinations(role, uuid) : [];

  // An exact hit is a page the sidebar links to, so it needs no back button.
  const current = destinations.find((item) => item.href === pathname);

  // A prefix hit is a child page — a mission detail, say. It borrows the
  // parent's title, and back points at the parent rather than at history, which
  // would be a dead end on a direct load.
  const parent = destinations.find((item) =>
    pathname.startsWith(`${item.href}/`),
  );

  const pageTitle =
    current?.name ??
    parent?.name ??
    (pathname.endsWith("/profile") ? "Profile" : "Dashboard");

  function getParentHref() {
    if (!parent) return pathname;
    if (role !== "admin" || !pathname.includes("/missions/submissions/")) {
      return parent.href;
    }

    const currentParams = new URLSearchParams(window.location.search);
    const section =
      currentParams.get("section") === "impact" ? "impact" : "submissions";
    const returnParams = new URLSearchParams({ section });
    const submissionStatus = currentParams.get("submissionStatus");

    if (
      section === "submissions" &&
      submissionStatus &&
      ["all", "pending", "approved", "rejected", "declined"].includes(
        submissionStatus,
      ) &&
      submissionStatus !== "all"
    ) {
      returnParams.set("submissionStatus", submissionStatus);
    }

    return `${parent.href}?${returnParams.toString()}`;
  }

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

  return (
    <header className="flex h-12 shrink-0 items-center justify-between px-4 md:p-4">
      <div className="flex items-center gap-2 md:gap-4">
        {parent ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => router.push(getParentHref())}
            aria-label={`Back to ${parent.name}`}
            className="h-9 w-9 rounded-full border border-border bg-muted text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
          </Button>
        ) : (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="h-9 w-6 rounded-full text-muted-foreground lg:hidden"
          >
            <Menu className="h-[18px] w-[18px] stroke-[1.7]" />
          </button>
        )}

        {parent ? (
          <Button
            asChild
            variant="outline"
            size="icon"
            className="hidden h-9 w-9 shrink-0 rounded-full border border-border bg-muted text-muted-foreground hover:bg-muted hover:text-foreground lg:inline-flex"
          >
            <Link
              href={parent.href}
              aria-label={`Back to ${parent.name}`}
              onClick={(event) => {
                const parentHref = getParentHref();
                if (parentHref !== parent.href) {
                  event.preventDefault();
                  router.push(parentHref);
                }
              }}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        ) : null}

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
          aria-label="Open notifications"
          aria-expanded={notificationsOpen}
          aria-controls="notification-panel"
          onClick={() => setNotificationsOpen(true)}
          className="relative h-9 w-9 rounded-full text-muted-foreground hover:bg-muted"
        >
          <Bell className="h-[18px] w-[18px] stroke-[1.7]" />
          {unreadNotificationCount > 0 ? (
            <span className="absolute right-0.5 top-0.5 flex min-h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-semibold leading-none text-destructive-foreground">
              {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
            </span>
          ) : null}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            if (role && uuid) router.push(`/${role}/${uuid}/profile`);
          }}
          className="h-9 w-9 rounded-full border border-border bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Open profile"
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt=""
              width={36}
              height={36}
              className="size-full rounded-full object-cover"
            />
          ) : (
            <User
              aria-hidden="true"
              className="h-[17px] w-[17px] stroke-[1.7]"
            />
          )}
        </Button>
      </div>
      <NotificationPanel
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        role={role}
        uuid={uuid}
      />
    </header>
  );
}
