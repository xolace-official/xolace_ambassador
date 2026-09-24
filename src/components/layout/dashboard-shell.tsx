"use client";

import { ReactNode, useState } from "react";
import { useParams } from "next/navigation";

import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";

export default function DashboardShell({
    children,
}: {
    children: ReactNode;
}) {
    const { role, uuid } = useParams() as {
        role: "admin" | "ambassador";
        uuid: string;
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen((current) => !current);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="h-screen overflow-hidden bg-dashboard-background">
            <div className="flex h-full">
                {/* DESKTOP SIDEBAR */}
                <Sidebar
                    role={role}
                    uuid={uuid}
                    isOpen={isSidebarOpen}
                    onClose={closeSidebar}
                />

                {/* MAIN APPLICATION AREA */}
                <main className="flex min-w-0 flex-1 flex-col">
                    {/* TOP BAR */}
                    <TopBar onMenuClick={toggleSidebar} />

                    {/* PAGE CONTENT */}
                    <div className="min-h-0 flex-1 overflow-hidden md:rounded-tl-[20px] bg-background/20">
                        <section className="h-full overflow-y-auto p-4">
                            {children}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}