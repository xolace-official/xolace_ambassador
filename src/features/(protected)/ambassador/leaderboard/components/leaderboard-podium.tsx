import { Crown, Medal, Target, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const numberFormat = new Intl.NumberFormat("en-GB");

interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  levelRank: number;
  contributionsApproved: number;
  missionsCompleted: number;
  peopleReached: number;
}

const placeStyles = [
  { place: 2, ring: "ring-1 ring-muted-foreground/30", badge: "bg-muted-foreground/20 text-muted-foreground" },
  { place: 1, ring: "ring-2 ring-primary", badge: "bg-primary/20 text-primary" },
  { place: 3, ring: "ring-1 ring-accent/30", badge: "bg-accent/20 text-accent" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function LeaderboardPodium({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[];
  currentUserId: string;
}) {
  const top3 = entries.slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {placeStyles.map(({ place, ring, badge }) => {
        const entry = top3[place - 1];
        if (!entry) return null;
        const isCurrentUser = entry.userId === currentUserId;
        return (
          <Card
            key={place}
            className={`relative overflow-hidden border-border bg-card p-5 ${ring} ${
              isCurrentUser ? "ring-2 ring-primary" : ""
            }`}
          >
            {isCurrentUser ? (
              <span className="absolute left-0 top-0 rounded-br-lg bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                YOU
              </span>
            ) : null}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {getInitials(entry.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {entry.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Level {entry.levelRank}
                  </p>
                </div>
              </div>
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${badge}`}
              >
                {place === 1 ? (
                  <Crown aria-hidden="true" className="size-4" />
                ) : (
                  `#${place}`
                )}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp aria-hidden="true" className="size-4 text-primary" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Points
                  </p>
                  <p className="text-sm font-bold tabular-nums text-foreground">
                    {numberFormat.format(entry.points)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target aria-hidden="true" className="size-4 text-success" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Missions
                  </p>
                  <p className="text-sm font-bold tabular-nums text-foreground">
                    {numberFormat.format(entry.missionsCompleted)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users aria-hidden="true" className="size-4 text-accent" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    People reached
                  </p>
                  <p className="text-sm font-bold tabular-nums text-foreground">
                    {numberFormat.format(entry.peopleReached)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Medal aria-hidden="true" className="size-4 text-warning" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Contributions
                  </p>
                  <p className="text-sm font-bold tabular-nums text-foreground">
                    {numberFormat.format(entry.contributionsApproved)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
