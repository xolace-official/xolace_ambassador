"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    CircleHelp,
    LogOut,
    Settings,
    ShieldCheck,
    Sparkles,
    UserPlus,
    X,
} from "lucide-react";

import { useAuthActions } from "@convex-dev/auth/react";

import {
    adminMenu,
    ambassadorMenu,
    type MenuItem,
} from "@/components/layout/menu";

import { XolaceLogo } from "@/components/layout/xolace-logo";

interface SidebarProps {
    role: "admin" | "ambassador";
    uuid: string;
    isOpen: boolean;
    onClose: () => void;
}

const bottomMenuItems = [
    {
        name: (role: SidebarProps["role"]) =>
            role === "admin" ? "Invite your team" : "Share invite link",
        icon: UserPlus,
        getHref: (role: SidebarProps["role"], uuid: string) =>
            `/${role}/${uuid}/invite`,
    },
    {
        name: () => "Settings",
        icon: Settings,
        getHref: (role: SidebarProps["role"], uuid: string) =>
            `/${role}/${uuid}/settings`,
    },
    {
        name: () => "Help",
        icon: CircleHelp,
        getHref: (role: SidebarProps["role"], uuid: string) =>
            `/${role}/${uuid}/help`,
    },
] as const;

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

export default function Sidebar({
    role,
    uuid,
    isOpen,
    onClose,
}: SidebarProps) {
    const pathname = usePathname();
    const { signOut } = useAuthActions();

    const menuItems: MenuItem[] =
        role === "admin" ? adminMenu : ambassadorMenu;

    const RoleIcon = roleMeta[role].icon;

    async function handleSignOut() {
        try {
            await signOut();
            window.location.href = "/login";
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    }

    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/20 lg:hidden"
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
                {/* Brand */}
                <div className="flex items-center justify-between px-2 pb-8">
                    <div className="flex items-center gap-3">
                        <XolaceLogo size="sm" />

                        <div className="flex items-center gap-1.5 border-l border-black/10 pl-3">
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
                        className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/60 transition-colors hover:bg-black/[0.035] hover:text-foreground lg:hidden"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Main navigation */}
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const href = item.href(uuid);

                        const isActive =
                            pathname === href ||
                            pathname.startsWith(`${href}/`);

                        return (
                            <Link
                                key={item.name}
                                href={href}
                                onClick={onClose}
                                className={`flex h-9 items-center gap-3 rounded-md px-3 font-semibold transition-colors text-[14px]
                                    ${isActive
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

                {/* Bottom navigation */}
                <div className="mt-auto pt-4 font-semibold text-[14px]">
                    <div className="">
                        {bottomMenuItems.map((item) => {
                            const Icon = item.icon;
                            const href = item.getHref(role, uuid);

                            return (
                                <Link
                                    key={item.name(role)}
                                    href={href}
                                    onClick={onClose}
                                    className="flex h-9 items-center gap-3 rounded-md px-3 text-foreground/80 transition-colors hover:bg-black/[0.035] hover:text-foreground"
                                >
                                    <Icon className="h-4 w-4 shrink-0 stroke-[1.8]" />
                                    <span>{item.name(role)}</span>
                                </Link>
                            );
                        })}

                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-destructive/80 transition-colors hover:bg-black/[0.035] hover:text-destructive"
                        >
                            <LogOut className="h-4 w-4 shrink-0 stroke-[1.8]" />
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}