"use client";

import { ExternalLink, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { XolaceLogo } from "@/components/layout/xolace-logo";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
}

const navigationData: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Ambassadors",
    href: "/ambassadors",
  },
];

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "unset";
  }, []);

  // Track scroll position to dynamically change navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeMenu]);

  const pathname = usePathname();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-60 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      <header
        className={`sticky top-0 z-50 left-0 w-full transition-[background-color,box-shadow,border-color] duration-300 ${
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
                <Link href="/login?from=landing">
                  <ExternalLink className="w-4 h-4" />
                  Visit Portal
                </Link>
              </Button>

              <button
                type="button"
                className="md:hidden p-2.5 text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-xl border border-border/60 bg-secondary/60 hover:bg-secondary transition-colors"
                onClick={openMenu}
                aria-label="Open navigation menu"
              >
                <Menu aria-hidden="true" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-background/98 backdrop-blur-xl flex flex-col justify-start p-6 sm:p-8 h-screen w-screen overflow-y-auto"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between pb-6 border-b border-border/50">
              <Link href="/" onClick={closeMenu}>
                <XolaceLogo size="sm" />
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close menu"
                className="p-2.5 rounded-full bg-secondary text-foreground hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer border border-border/50"
              >
                <X aria-hidden="true" className="w-6 h-6" />
              </button>
            </div>

            <div className="my-2 py-8 space-y-6 flex flex-col items-start w-full">
              {navigationData.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeMenu}
                    className={`w-full py-3 px-4 rounded-2xl text-3xl font-black transition-[color,background-color] flex items-center justify-between ${
                      isActive
                        ? "text-primary font-bold border-b-2 border-primary"
                        : "text-foreground/80 hover:text-primary"
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div />

            <div className="pt-6 border-t border-border/50 space-y-4">
              <Button
                size="lg"
                asChild
                className="w-full py-4 rounded-full font-extrabold text-base shadow-xl shadow-primary/25"
              >
                <Link href="/login" onClick={closeMenu}>
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Visit Ambassador Portal
                </Link>
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
