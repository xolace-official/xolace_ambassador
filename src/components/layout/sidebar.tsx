"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut, ShieldCheck, Sparkles, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { InviteDialog } from "@/components/layout/invite-dialog";
import {
  adminMenu,
  ambassadorMenu,
  type MenuItem,
  UTILITY_MENU,
} from "@/components/layout/menu";
import { XolaceLogo } from "@/components/layout/xolace-logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SidebarProps {
  role: "admin" | "ambassador";
  uuid: string;
  isOpen: boolean;
  onClose: () => void;
}

const inviteLabel = (role: SidebarProps["role"]) =>
  role === "admin" ? "Invite your team" : "Share invite link";

const roleMeta = {
  admin: {
    label: "Admin",
    icon: ShieldCheck,
  },
  ambassador: {
    label: "Ambassador",
    icon: Sparkles,
  },
} as const;

export default function Sidebar({ role, uuid, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { signOut } = useAuthActions();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const menuItems: MenuItem[] = role === "admin" ? adminMenu : ambassadorMenu;

  const RoleIcon = roleMeta[role].icon;

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsSigningOut(false);
    }
  }

  // The drawer sits at z-50 on mobile, the same layer as the dialog, so opening
  // one over the other left both visible. Close the drawer first.
  function openSignOutDialog() {
    onClose();
    setSignOutOpen(true);
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-full w-[260px] shrink-0 flex-col
          bg-dashboard-background px-2 py-2
          transition-transform duration-200 ease-out
          lg:static lg:z-auto lg:w-[220px] lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-2 pb-8">
          <div className="flex items-center gap-3">
            <XolaceLogo size="sm" />

            <div className="flex items-center gap-1.5 border-l border-foreground/10 pl-3">
              <RoleIcon className="h-3.5 w-3.5 text-foreground/50" />

              {/* <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-foreground/55">
                                {roleMeta[role].label}
                            </span> */}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const baseHref = item.href(uuid);
            const viewParam = searchParams.get("view");
            const href =
              viewParam && baseHref === `/admin/${uuid}/ambassadors`
                ? `${baseHref}?view=${viewParam}`
                : baseHref;

            const isActive =
              pathname === baseHref || pathname.startsWith(`${baseHref}/`);

            return (
              <Link
                key={item.name}
                href={href}
                onClick={onClose}
                className={`flex h-9 items-center gap-3 rounded-md px-3 font-semibold transition-colors text-[14px]
                                    ${
                                      isActive
                                        ? "bg-foreground/7 text-foreground"
                                        : "text-foreground hover:bg-foreground/5 hover:text-foreground"
                                    }
                `}
              >
                <item.icon className="h-4 w-4 shrink-0 stroke-[1.8]" />

                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 font-semibold text-[14px]">
          <button
            type="button"
            onClick={() => {
              onClose();
              setInviteOpen(true);
            }}
            className="mt-1 flex h-8 w-full items-center gap-3 rounded-md px-3.5 text-left text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <UserPlus
              className="h-4 w-4 shrink-0 stroke-[1.8]"
              aria-hidden="true"
            />
            <span>{inviteLabel(role)}</span>
          </button>

          {UTILITY_MENU.map((item) => {
            const Icon = item.icon;
            const href = `/${role}/${uuid}/${item.slug}`;

            return (
              <Link
                key={item.name}
                href={href}
                onClick={onClose}
                className="mt-1 flex h-8 items-center gap-3 rounded-md px-3 text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <Icon
                  className="h-4 w-4 shrink-0 stroke-[1.8]"
                  aria-hidden="true"
                />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={openSignOutDialog}
            disabled={isSigningOut}
            className="mt-1 flex h-8 w-full items-center gap-3 rounded-md px-3 text-left text-destructive/80 transition-colors hover:bg-foreground/5 hover:text-destructive"
          >
            <LogOut
              className="h-4 w-4 shrink-0 stroke-[1.8]"
              aria-hidden="true"
            />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <DialogContent className="w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You’ll need to sign in again to access your portal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSignOutOpen(false)}
              disabled={isSigningOut}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing out…" : "Sign out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
