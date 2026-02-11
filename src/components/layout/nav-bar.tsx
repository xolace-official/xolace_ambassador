'use client'

import React, {useEffect, useState, useRef, useCallback} from "react"
import {Menu, X, ChevronDown} from "lucide-react"
import Link from 'next/link'
import Image from "next/image"
import {usePathname, useRouter} from 'next/navigation'
import {motion, AnimatePresence} from 'motion/react'
import mascot from '../../../public/assets/x-logo-full.webp'
import {Button} from "@/components/ui/button"

interface DropdownItem {
  label: string
  href: string
  description?: string
  icon?: React.ReactNode
}

interface NavItem {
  label: string
  href: string
  dropdown?: DropdownItem[]
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
]

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const openMenu = useCallback(() => {
    setIsOpen(true)
    document.body.style.overflow = "hidden"
  }, [])

  const closeMenu = useCallback(() => {
    setIsOpen(false)
    document.body.style.overflow = "unset"
  }, [])

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveDropdown(label)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isOpen, closeMenu])

  // Auto-close mobile menu on scroll (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768 && isOpen) {
        closeMenu()
      }
    }

    if (isOpen) {
      window.addEventListener("scroll", handleScroll, {passive: true})
    }

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isOpen, closeMenu])

  const pathname = usePathname()
  const router = useRouter()

  const scrollToApply = () => {
    closeMenu()
    if (pathname === "/") {
      const applySection = document.getElementById('signup-form')
      if (applySection) {
        applySection.scrollIntoView({behavior: 'smooth'})
      }
    } else {
      router.push('/#signup-form')
    }
  }

  return (
    <header className=" px-2 sm:px-0 md:px-[5%] sticky top-2 z-50 left-0 w-full">
      <div
        className="max-w-6xl mx-auto w-full py-1 px-2 flex items-center justify-between border border-border bg-muted rounded-2xl">
        <div className="w-full flex flex-row gap-8">
          <Link href="/">
            <Image
              src={mascot}
              alt="logo"
              width={40}
              height={40}
              priority={true}
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="w-full hidden md:flex items-center justify-start space-x-6 font-semibold">
            {navigationData.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                {item.dropdown ? (
                  <button className="cursor-pointer flex items-center gap-1 hover:text-primary transition">
                    {item.label}
                    <ChevronDown
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

                {/* Desktop Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === item.label && item.dropdown ? (
                    <motion.div
                      initial={{opacity: 0, y: 10, scale: 0.95}}
                      animate={{opacity: 1, y: 0, scale: 1}}
                      exit={{opacity: 0, y: 10, scale: 0.95}}
                      transition={{duration: 0.2}}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-muted rounded-xl shadow-lg border border-border py-2 z-50"
                    >
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.label}
                          href={dropdownItem.href}
                          className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-accent/60 transition-colors duration-150 rounded-lg mx-2"
                        >
                          <div className="text-primary mt-0.5 shrink-0">
                            {dropdownItem.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {dropdownItem.label}
                            </div>
                            {dropdownItem.description ? (
                              <div className="text-muted-foreground text-xs mt-1 line-clamp-2">
                                {dropdownItem.description}
                              </div>
                            ) : null}
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen ? (
            <>
              <motion.div
                className="fixed inset-0 z-40"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.2}}
                onClick={closeMenu}
              />

              <motion.div
                className="fixed top-0 left-0 w-full p-6 shadow-lg z-50 bg-muted max-h-screen overflow-y-auto"
                initial={{y: -100, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                exit={{y: -100, opacity: 0}}
                transition={{duration: 0.3, ease: "easeInOut"}}
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold"></span>
                  <button type="button" onClick={closeMenu}>
                    <X className="w-6 h-6"/>
                  </button>
                </div>
                <div className="mt-8 flex flex-col space-y-4">
                  {navigationData.map((item) => (
                    <MobileNavItem
                      key={item.label}
                      item={item}
                      onLinkClick={closeMenu}
                    />
                  ))}

                  <Button
                    onClick={scrollToApply}
                    className="mt-4"
                    size="lg"
                  >
                    Apply Now
                  </Button>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-row gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={scrollToApply}
          >
            Apply Now
          </Button>

          {/* Mobile menu button */}
          <button type="button" className="md:hidden p-2" onClick={openMenu}>
            <Menu className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </header>
  )
}

function MobileNavItem(
  {
    item,
    onLinkClick,
  }: {
    item: NavItem
    onLinkClick: () => void
  }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border last:border-b-0 pb-4 last:pb-0">
      <button
      type="button"
        onClick={() => item.dropdown ? setIsOpen(!isOpen) : null}
        className="flex items-center justify-between w-full text-left py-3 font-medium text-base transition-colors duration-200 min-h-11"
      >
        {item.dropdown ? (
          <>
            {item.label}
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 shrink-0 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </>
        ) : (
          <Link href={item.href} className="w-full" onClick={onLinkClick}>
            {item.label}
          </Link>
        )}
      </button>

      <AnimatePresence>
        {isOpen && item.dropdown ? (
          <motion.div
            initial={{opacity: 0, height: 0}}
            animate={{opacity: 1, height: "auto"}}
            exit={{opacity: 0, height: 0}}
            transition={{duration: 0.2}}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-2 space-y-1">
              {item.dropdown.map((dropdownItem) => (
                <Link
                  key={dropdownItem.label}
                  href={dropdownItem.href}
                  className="flex items-start gap-3 py-3 text-sm hover:bg-muted rounded-lg px-3 -mx-3 transition-colors duration-200 min-h-11"
                  onClick={onLinkClick}
                >
                  <div className="text-primary mt-1 shrink-0">
                    {dropdownItem.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{dropdownItem.label}</div>
                    {dropdownItem.description ? (
                      <div className="text-muted-foreground text-xs mt-1 line-clamp-2">
                        {dropdownItem.description}
                      </div>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default NavBar
