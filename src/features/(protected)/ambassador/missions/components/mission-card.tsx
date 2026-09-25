import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Mission } from "@/types/missions.type";
import { MissionDeadline } from "./mission-deadline";
import { MissionStatus } from "./mission-status";

interface MissionCardProps {
  mission: Mission;
  href: string;
}

export function MissionCard({ mission, href }: MissionCardProps) {
  return (
    <article className="group rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {mission.category}
          </p>

          <h2 className="mt-2 text-lg font-semibold tracking-tight text-card-foreground">
            {mission.title}
          </h2>
        </div>

        <MissionStatus status={mission.status} />
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        {mission.description}
      </p>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-foreground">
            {mission.points} points
          </span>

          <span className="text-sm capitalize text-muted-foreground">
            {mission.difficulty}
          </span>

          <MissionDeadline endsAt={mission.endsAt} />
        </div>

        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          View mission
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </article>
  );
}
