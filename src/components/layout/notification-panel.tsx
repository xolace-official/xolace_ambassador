"use client";

import { useMutation, useQuery } from "convex/react";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  FolderOpen,
  type LucideIcon,
  Megaphone,
  Target,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "../../../convex/_generated/api";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  date: number;
  kind: "mission" | "review" | "reward" | "resource" | "community";
  href: string;
  unread: boolean;
};
type NotificationFilter = "all" | "unread" | "read";

const notificationIcons: Record<NotificationItem["kind"], LucideIcon> = {
  mission: Target,
  review: CheckCircle2,
  reward: Trophy,
  resource: FolderOpen,
  community: Megaphone,
};

const notificationDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function formatNotificationTime(timestamp: number) {
  const elapsed = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (elapsed < minute) return "Just now";
  if (elapsed < hour) return `${Math.floor(elapsed / minute)}m ago`;
  if (elapsed < day) return `${Math.floor(elapsed / hour)}h ago`;
  if (elapsed < week) return `${Math.floor(elapsed / day)}d ago`;
  return notificationDateFormatter.format(timestamp);
}

export function NotificationPanel({
  open,
  onOpenChange,
  onNotificationOpen,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNotificationOpen: () => void;
}) {
  const rows = useQuery(api.notifications.list);
  const markRead = useMutation(api.notifications.markRead);
  const router = useRouter();
  const [locallyRead, setLocallyRead] = useState<Set<string>>(() => new Set());
  const notifications = useMemo(
    () =>
      (rows ?? []).map((notification) => ({
        id: notification._id,
        title: notification.title,
        description: notification.description,
        date: notification._creationTime,
        kind: notification.kind,
        href: notification.href,
        unread:
          notification.readAt === null && !locallyRead.has(notification._id),
      })),
    [locallyRead, rows],
  );
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [visibleCount, setVisibleCount] = useState(4);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        if (filter === "unread") return notification.unread;
        if (filter === "read") return !notification.unread;
        return true;
      }),
    [filter, notifications],
  );
  const visibleNotifications = filteredNotifications.slice(0, visibleCount);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || visibleCount >= filteredNotifications.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => count + 4);
        }
      },
      { root: scrollContainerRef.current, rootMargin: "120px" },
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, [filteredNotifications.length, visibleCount]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        id="notification-panel"
        showCloseButton={false}
        className="inset-0 flex h-dvh max-h-dvh max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none p-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:w-[min(100%,24rem)] sm:max-w-md sm:translate-x-0 sm:translate-y-0 sm:rounded-l-2xl sm:rounded-r-none"
      >
        <DialogHeader className="shrink-0 flex-row items-start justify-between border-b border-border bg-background p-3 text-left sm:p-4">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Bell aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base">Notifications</DialogTitle>
              <DialogDescription className="mt-0.5 text-xs leading-5">
                Updates about your missions, contributions, and program.
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close notifications"
              className="size-9 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div
          ref={scrollContainerRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4"
        >
          {visibleNotifications.length ? (
            <div className="space-y-2" aria-live="polite">
              {visibleNotifications.map((notification) => {
                const Icon = notificationIcons[notification.kind];
                return (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    onClick={(event) => {
                      if (notification.unread) {
                        event.preventDefault();
                        onOpenChange(false);
                        onNotificationOpen();
                        setLocallyRead((current) => {
                          const next = new Set(current);
                          next.add(notification.id);
                          return next;
                        });
                        void markRead({ notificationId: notification.id }).then(
                          () => router.push(notification.href),
                        );
                      } else {
                        onOpenChange(false);
                        onNotificationOpen();
                      }
                    }}
                    className={`group flex gap-2 rounded-xl border border-border p-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${notification.unread ? "bg-muted/40" : ""}`}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon aria-hidden="true" className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {notification.title}
                        </span>
                        <ChevronRight
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                      <span className="mt-0.5 block line-clamp-1 text-xs leading-4 text-muted-foreground">
                        {notification.description}
                      </span>
                      <time
                        dateTime={new Date(notification.date).toISOString()}
                        className="mt-1 block text-right text-[10px] text-muted-foreground/70"
                      >
                        {formatNotificationTime(notification.date)}
                      </time>
                    </span>
                    {notification.unread ? (
                      <span className="mt-1 flex shrink-0 items-start">
                        <span
                          aria-hidden="true"
                          className="size-2 rounded-full bg-primary"
                        />
                        <span className="sr-only">Unread</span>
                      </span>
                    ) : null}
                  </Link>
                );
              })}
              <div ref={loadMoreRef} aria-hidden="true" className="h-1" />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-xs text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Bell aria-hidden="true" className="size-5" />
                </span>
                <h2 className="mt-4 text-sm font-semibold text-foreground">
                  {filter === "all"
                    ? "You’re all caught up"
                    : `No ${filter} notifications`}
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  New mission updates, contribution reviews, and program news
                  will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="sticky bottom-0 flex shrink-0 justify-end border-t border-border bg-background p-2.5 sm:p-3">
          <div className="inline-flex rounded-3xl border border-border bg-muted/30 p-1">
            {(["all", "unread", "read"] as const).map((option) => (
              <Button
                key={option}
                type="button"
                variant={filter === option ? "secondary" : "ghost"}
                size="sm"
                aria-pressed={filter === option}
                onClick={() => {
                  setFilter(option);
                  setVisibleCount(4);
                }}
                className="min-h-8 rounded-3xl px-3 text-xs capitalize"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
