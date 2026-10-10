"use client";

import {
  ChevronRight,
  Home,
  type LucideIcon,
  Menu,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { XolaceLogo } from "@/components/layout/xolace-logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navigationData: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Ambassadors", href: "/ambassadors", icon: Users },
];

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // A route change can happen without the link's own click handler running,
  // e.g. browser back while the sheet is open.
  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    setIsOpen(false);
  }, [pathname]);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-toast focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      <header
        className={`sticky top-0 z-header left-0 w-full transition-[background-color,box-shadow,border-color] duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border/80 shadow-md py-3"
            : "bg-background/60 backdrop-blur-sm border-b border-border/40 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <XolaceLogo size="sm" priority />
          </Link>

          <div className="flex items-center gap-6 sm:gap-8">
            <nav className="hidden md:flex items-center space-x-6 font-semibold text-sm">
              {navigationData.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`cursor-pointer transition-colors py-1 ${
                      isActive
                        ? "text-primary font-bold border-b-2 border-primary"
                        : "text-foreground/80 hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                asChild
                className="hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold shadow-md shadow-primary/20 hover:scale-105 transition-transform"
              >
                <Link href="/login?from=landing">Visit Portal</Link>
              </Button>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="md:hidden flex size-11 items-center justify-center text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-xl border border-border/60 bg-secondary/60 hover:bg-secondary transition-colors"
                    aria-label="Open navigation menu"
                  >
                    <Menu aria-hidden="true" className="w-5 h-5" />
                  </button>
                </DialogTrigger>

                <DialogContent
                  id="mobile-nav-drawer"
                  showCloseButton={false}
                  className="inset-0 flex h-dvh max-h-dvh max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none p-0 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[min(100%,24rem)] md:max-w-md md:rounded-l-2xl md:rounded-r-none"
                >
                  <div className="shrink-0 bg-background">
                    {/* Mirrors the header's own container and padding so the logo
                        and the close button land on the same coordinates as the
                        header logo and the hamburger that opened this. */}
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                      <Link href="/" onClick={closeMenu} className="shrink-0">
                        <XolaceLogo size="sm" />
                      </Link>

                      <DialogTitle className="sr-only">
                        Navigation menu
                      </DialogTitle>
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Close menu"
                          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-secondary/60 text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        >
                          <X aria-hidden="true" className="size-5" />
                        </Button>
                      </DialogClose>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
                    <nav aria-label="Mobile" className="space-y-2">
                      {navigationData.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={closeMenu}
                            aria-current={isActive ? "page" : undefined}
                            className={`group flex min-h-14 items-center gap-3 rounded-xl border p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              isActive
                                ? "border-primary/40 bg-primary/10"
                                : "border-border hover:bg-muted"
                            }`}
                          >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                              <Icon aria-hidden="true" className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
                              {item.label}
                            </span>
                            <ChevronRight
                              aria-hidden="true"
                              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                            />
                          </Link>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="shrink-0 bg-background px-2.5 pt-2.5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                    <Button
                      size="lg"
                      asChild
                      className="w-full min-h-12 rounded-full font-extrabold shadow-lg shadow-primary/20"
                    >
                      <Link href="/login?from=landing" onClick={closeMenu}>
                        Visit Ambassador Portal
                      </Link>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default NavBar;
