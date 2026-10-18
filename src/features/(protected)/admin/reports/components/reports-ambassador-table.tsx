import { Card } from "@/components/ui/card";

const numberFormat = new Intl.NumberFormat("en-GB");

interface AmbassadorReport {
  userId: string;
  name: string;
  track: string | null;
  points: number;
  contributionsApproved: number;
  missionsCompleted: number;
  lastActivityAt: number | null;
}

export function ReportsAmbassadorTable({
  ambassadors,
}: {
  ambassadors: AmbassadorReport[];
}) {
  return (
    <Card className="overflow-hidden border-border">
      <div className="border-b border-border p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Ambassador performance
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Ranked by total points earned
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ambassador
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Track
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Points
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Contributions
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Missions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ambassadors.map((a) => (
              <tr
                key={a.userId}
                className="hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {a.name}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {a.track ?? "—"}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-foreground">
                  {numberFormat.format(a.points)}
                </td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground">
                  {numberFormat.format(a.contributionsApproved)}
                </td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground">
                  {numberFormat.format(a.missionsCompleted)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
