"use client";

import { useConvexAuth } from "@convex-dev/auth/react";
import { Bell, Menu, Moon, Sun, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  adminMenu,
  ambassadorMenu,
  type MenuItem,
} from "@/components/layout/menu";
import { Button } from "@/components/ui/button";

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

  const [, role, uuid] = pathname.split("/");

  const { resolvedTheme, setTheme } = useTheme();
  // Theme is unknown until after hydration â€” the mounted check avoids a
  // server/client mismatch on the icon shown.
  const themeMounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const isDark = themeMounted && resolvedTheme === "dark";

  const menuItems: MenuItem[] = role === "admin" ? adminMenu : ambassadorMenu;

  // Find the menu item that matches the current pathname.
  const currentMenuItem = menuItems.find((item) => {
    const href = item.href(uuid);

    return pathname === href || pathname.startsWith(`${href}/`);
  });

  const pageTitle = currentMenuItem?.name ?? "Dashboard";

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

        <h4 className="text-sm font-semibold uppercase tracking-wide">
          {pageTitle}
        </h4>
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
