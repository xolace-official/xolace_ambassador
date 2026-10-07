import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const numberFormat = new Intl.NumberFormat("en-GB");

interface MissionReport {
  missionId: string;
  title: string;
  status: "draft" | "published" | "closed";
  submissions: number;
  approved: number;
  rejected: number;
  pointsAwarded: number;
}

const statusStyle: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-success/10 text-success",
  closed: "bg-muted-foreground/20 text-muted-foreground",
};

export function ReportsMissionTable({
  missions,
}: {
  missions: MissionReport[];
}) {
  return (
    <Card className="overflow-hidden border-border">
      <div className="border-b border-border p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Mission outcomes
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Submissions, approvals, and points per mission
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Mission
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Submissions
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Approved
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Rejected
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {missions.map((m) => (
              <tr
                key={m.missionId}
                className="hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {m.title}
                </td>
                <td className="px-4 py-3">
                  <Badge className={statusStyle[m.status]}>{m.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground">
                  {numberFormat.format(m.submissions)}
                </td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-success">
                  {numberFormat.format(m.approved)}
                </td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground">
                  {numberFormat.format(m.rejected)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-foreground">
                  {numberFormat.format(m.pointsAwarded)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
