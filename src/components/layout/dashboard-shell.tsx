"use client";

import { useQuery } from "convex/react";
import { type ReactNode, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import type { PortalRole } from "@/types/portal.type";
import { api } from "../../../convex/_generated/api";

export default function DashboardShell({
  portalRole,
  children,
}: {
  portalRole: PortalRole;
  children: ReactNode;
}) {
  // uuid comes from the session, not the url, so a hand-edited path can never
  // build a link into someone else's portal.
  const user = useQuery(api.users.current);

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
        <Sidebar
          role={portalRole}
          uuid={user?._id ?? ""}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenuClick={toggleSidebar} />

          <div className="min-h-0 flex-1 overflow-hidden md:rounded-tl-[20px] bg-background/50 dark:bg-background/20">
            <section className="h-full overflow-y-auto p-4 md:p-8">
              {children}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
