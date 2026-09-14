"use client";

import { ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { XolaceLogo } from "@/components/layout/xolace-logo";
import { Button } from "@/components/ui/button";

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
  icon?: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "unset";
  }, []);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, closeMenu]);

  const pathname = usePathname();
  const router = useRouter();

  const scrollToApply = () => {
    closeMenu();
    if (pathname === "/") {
      const applySection = document.getElementById("apply");
      if (applySection) {
        applySection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push("/#apply");
    }
  };

  const handleVisitPortal = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    alert("Ambassador Portal is launching soon! Stay tuned.");
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Full Width Edge-to-Edge Header (No top padding) */}
      <header className="sticky top-0 z-50 left-0 w-full bg-background/95 backdrop-blur-md border-b border-border/60">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <XolaceLogo size="sm" priority />
            </Link>

            {/* Desktop Nav Items */}
            <nav className="hidden md:flex items-center space-x-6 font-semibold">
              {navigationData.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() =>
                    item.dropdown && handleMouseEnter(item.label)
                  }
                  onMouseLeave={handleMouseLeave}
                >
                  {item.dropdown ? (
                    <button
                      type="button"
                      className="cursor-pointer flex items-center gap-1 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm"
                    >
                      {item.label}
                      <ChevronDown
                        aria-hidden="true"
                        className={`w-3 h-3 transition-transform duration-200 ${
                          activeDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="cursor-pointer hover:text-primary transition"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Action Buttons: Visit Portal & Apply Now */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVisitPortal}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border-border/80 font-bold hover:bg-secondary"
            >
              <ExternalLink className="w-3.5 h-3.5 text-primary" />
              Visit Portal
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={scrollToApply}
              className="rounded-xl font-bold shadow-md shadow-primary/20"
            >
              Apply Now
            </Button>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              className="md:hidden p-2 text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-lg border border-border/50 bg-secondary/50"
              onClick={openMenu}
              aria-label="Open navigation menu"
            >
              <Menu aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Full Height Animated Overlay */}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-background flex flex-col justify-between p-6 sm:p-8 h-screen w-screen overflow-y-auto"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Mobile Header Bar */}
            <div className="flex items-center justify-between pb-6 border-b border-border/50">
              <Link href="/" onClick={closeMenu}>
                <XolaceLogo size="sm" />
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close menu"
                className="p-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
              >
                <X aria-hidden="true" className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="my-auto py-8 space-y-6 flex flex-col items-start">
              {navigationData.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="text-3xl font-extrabold text-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}

              <button
                type="button"
                onClick={handleVisitPortal}
                className="inline-flex items-center gap-2 text-2xl font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="w-5 h-5" /> Visit Portal (Soon)
              </button>
            </div>

            {/* Mobile Action Buttons */}
            <div className="pt-6 border-t border-border/50 space-y-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleVisitPortal}
                className="w-full py-3.5 rounded-2xl font-bold border-border/80"
              >
                <ExternalLink className="w-4 h-4 mr-2 text-primary" />
                Visit Ambassador Portal
              </Button>
              <Button
                onClick={scrollToApply}
                size="lg"
                className="w-full py-3.5 rounded-2xl font-bold shadow-lg shadow-primary/25"
              >
                Apply Now
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
