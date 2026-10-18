import { Card } from "@/components/ui/card";
import { LeaderboardAvatar } from "./leaderboard-avatar";

const numberFormat = new Intl.NumberFormat("en-GB");

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  points: number;
  levelRank: number;
  contributionsApproved: number;
  missionsCompleted: number;
  peopleReached: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  page: number;
  pageSize: number;
}

export function LeaderboardTable({
  entries,
  currentUserId,
  page,
  pageSize,
}: LeaderboardTableProps) {
  const start = (page - 1) * pageSize;
  const pageEntries = entries.slice(start, start + pageSize);

  return (
    <Card className="overflow-hidden border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ambassador
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Points
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Level
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Contributions
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Missions
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                People reached
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageEntries.map((entry) => {
              const rank = entry.rank;
              const isCurrentUser = entry.userId === currentUserId;
              return (
                <tr
                  key={entry.userId}
                  className={`${
                    isCurrentUser
                      ? "bg-primary/10 border-l-2 border-l-primary"
                      : "hover:bg-muted/20"
                  } transition-colors`}
                >
                  <td className="px-4 py-3 pb-3">
                    <span className="text-sm font-bold tabular-nums text-muted-foreground">
                      {rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 pb-3">
                    <div className="flex items-center gap-3">
                      <LeaderboardAvatar
                        name={entry.name}
                        image={entry.image}
                        size="sm"
                      />
                      <span className="truncate text-sm font-medium text-foreground">
                        {entry.name}
                        {isCurrentUser ? (
                          <span className="ml-1 text-xs text-primary">
                            (you)
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 pb-3 text-right text-sm font-semibold tabular-nums text-foreground">
                    {numberFormat.format(entry.points)}
                  </td>
                  <td className="px-4 py-3 pb-3 text-right text-sm tabular-nums text-muted-foreground">
                    {entry.levelRank}
                  </td>
                  <td className="px-4 py-3 pb-3 text-right text-sm tabular-nums text-muted-foreground">
                    {numberFormat.format(entry.contributionsApproved)}
                  </td>
                  <td className="px-4 py-3 pb-3 text-right text-sm tabular-nums text-muted-foreground">
                    {numberFormat.format(entry.missionsCompleted)}
                  </td>
                  <td className="px-4 py-3 pb-3 text-right text-sm tabular-nums text-muted-foreground">
                    {numberFormat.format(entry.peopleReached)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
