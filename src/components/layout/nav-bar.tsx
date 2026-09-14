"use client";

import { ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const [isScrolled, setIsScrolled] = useState(false);
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

      {/* Full Width Edge-to-Edge Header with Dynamic Scroll Background */}
      <header
        className={`sticky top-0 z-50 left-0 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border/80 shadow-md py-3"
            : "bg-background/60 backdrop-blur-sm border-b border-border/40 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <Link href="/" className="shrink-0">
            <XolaceLogo size="sm" priority />
          </Link>

          {/* Right Side: Shifted Nav Links & ONLY Visit Portal Button */}
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Desktop Nav Items Shifted to Right */}
            <nav className="hidden md:flex items-center space-x-6 font-semibold text-sm">
              {navigationData.map((item) => {
                const isActive = pathname === item.href;
                return (
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
                        className={`cursor-pointer transition-colors py-1 ${
                          isActive
                            ? "text-primary font-bold border-b-2 border-primary"
                            : "text-foreground/80 hover:text-primary"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* ONLY Visit Portal Button on Header */}
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={handleVisitPortal}
                className="hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-bold shadow-md shadow-primary/20 hover:scale-105 transition-transform"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Portal
              </Button>

              {/* Mobile Menu Hamburger Trigger */}
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

      {/* Redesigned Mobile Drawer Full-Height Overlay */}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-background/98 backdrop-blur-xl flex flex-col justify-start p-6 sm:p-8 h-screen w-screen overflow-y-auto"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top Bar inside Drawer */}
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

            {/* Middle Nav Items */}
            <div className="my-2 py-8 space-y-6 flex flex-col items-start w-full">

              {navigationData.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeMenu}
                    className={`w-full py-3 px-4 rounded-2xl text-3xl font-black transition-all flex items-center justify-between ${
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
            <div/>

            {/* Bottom Card & CTA */}
            <div className="pt-6 border-t border-border/50 space-y-4">
              <Button
                onClick={handleVisitPortal}
                size="lg"
                className="w-full py-4 rounded-full font-extrabold text-base shadow-xl shadow-primary/25"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Visit Ambassador Portal
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
