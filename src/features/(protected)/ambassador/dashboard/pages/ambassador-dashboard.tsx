"use client";

import { useQuery } from "convex/react";
import { CalendarIcon, MapPin } from "lucide-react";
import { useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../../../../../../convex/_generated/api";
import { AmbassadorDashboardSkeleton } from "../components/ambassador-dashboard-skeleton";
import { AmbassadorDashboardStats } from "../components/ambassador-dashboard-stats";
import { AmbassadorOverviewPanels } from "../components/ambassador-overview-panels";

export default function AmbassadorDashboard() {
  const { uuid } = useParams<{ uuid: string }>();
  const profile = useQuery(api.ambassadors.getProfile);
  const missions = useQuery(api.missions.list, { now: Date.now() });

  if (profile === undefined || missions === undefined) {
    return <AmbassadorDashboardSkeleton />;
  }

  const totals = profile.totals;
  const points = totals?.points ?? 0;

  return (
    <div className="-m-4 min-h-full space-y-5 p-4 sm:-m-8 sm:space-y-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Overview
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select defaultValue="all-locations">
            <SelectTrigger aria-label="Filter location" className="gap-2">
              <MapPin aria-hidden="true" className="size-4" />
              <SelectValue placeholder="Filter Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-locations">Filter Location</SelectItem>
              <SelectItem value="campus">Campus</SelectItem>
              <SelectItem value="community">Community</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-dates">
            <SelectTrigger aria-label="Filter date" className="gap-2">
              <CalendarIcon aria-hidden="true" className="size-4" />
              <SelectValue placeholder="Filter Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-dates">Filter Date</SelectItem>
              <SelectItem value="this-week">This week</SelectItem>
              <SelectItem value="this-month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AmbassadorDashboardStats
        points={points}
        missions={totals?.missionsCompleted ?? 0}
        peopleReached={totals?.peopleReached ?? 0}
        recognitions={profile.recognitions.length}
      />

      <AmbassadorOverviewPanels
        profile={profile}
        missions={missions}
        uuid={uuid}
      />
    </div>
  );
}
