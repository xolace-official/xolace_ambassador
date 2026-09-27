"use client";

import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { MapPin, Users } from "lucide-react";
import { useQueryState } from "nuqs";
import { parseAsStringLiteral } from "nuqs/server";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MISSION_CATEGORY_LABELS } from "@/types/missions.type";
import { api } from "../../../../../../convex/_generated/api";

const DETAIL_TABS = [
  "overview",
  "missions",
  "analytics",
  "community",
  "reports",
  "rewards",
  "impact",
] as const;
const parseDetailTab = parseAsStringLiteral(DETAIL_TABS)
  .withDefault("overview")
  .withOptions({ clearOnDefault: true });

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const numberFormat = new Intl.NumberFormat("en-GB");

export default function AdminAmbassadorDetail({
  ambassadorId,
}: {
  ambassadorId: string;
}) {
  const ambassador = useQuery(api.ambassadors.adminGet, { ambassadorId });
  const [tab, setTab] = useQueryState("section", parseDetailTab);

  if (ambassador === undefined) {
    return (
      <output
        className="block space-y-4"
        aria-label="Loading ambassador details"
      >
        <div
          aria-hidden="true"
          className="h-36 animate-pulse rounded-xl bg-card"
        />
        <div
          aria-hidden="true"
          className="h-72 animate-pulse rounded-xl bg-card"
        />
      </output>
    );
  }

  if (ambassador === null) {
    return (
      <EmptyState
        title="Ambassador not found"
        description="This account may have been removed or may no longer be an ambassador."
      />
    );
  }

  const totals = ambassador.totals;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 pb-12">
      <header className="grid gap-5 border-b border-border pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {ambassador.name ?? "Ambassador"}
            </h1>
            <Badge
              className={statusClass(ambassador.profile?.status ?? "active")}
            >
              {ambassador.profile?.status ?? "active"}
            </Badge>
            {ambassador.profile?.track ? (
              <Badge variant="outline">
                {MISSION_CATEGORY_LABELS[ambassador.profile.track]}
              </Badge>
            ) : null}
          </div>
          {ambassador.email ? (
            <a
              href={`mailto:${ambassador.email}`}
              className="block min-h-11 w-fit max-w-full break-all py-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ambassador.email}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No email on file</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {ambassador.profile?.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden="true" className="size-4" />
                {ambassador.profile.location}
              </span>
            ) : null}
            {ambassador.profile?.podName ? (
              <span className="inline-flex items-center gap-1.5">
                <Users aria-hidden="true" className="size-4" />
                {ambassador.profile.podName}
              </span>
            ) : null}
            <span>
              Joined {dateFormat.format(new Date(ambassador.joinedAt))}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:w-64">
          <Metric label="Points" value={totals?.points ?? 0} />
          <Metric label="Missions" value={totals?.missionsCompleted ?? 0} />
        </div>
      </header>

      <nav
        aria-label="Ambassador details"
        className="flex gap-5 overflow-x-auto border-b border-border"
      >
        {DETAIL_TABS.map((value) => (
          <button
            key={value}
            type="button"
            aria-current={tab === value ? "page" : undefined}
            onClick={() => void setTab(value)}
            className={`min-h-11 shrink-0 border-b-2 px-1 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              tab === value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {value}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <Overview ambassador={ambassador} />
      ) : tab === "missions" ? (
        <ContributionTable
          title="Mission submissions"
          rows={ambassador.contributions.filter(
            (contribution) => contribution.kind === "mission_submission",
          )}
          emptyMessage="No mission submissions have been recorded."
        />
      ) : tab === "analytics" ? (
        <Analytics ambassador={ambassador} />
      ) : tab === "community" ? (
        <Community ambassador={ambassador} />
      ) : tab === "reports" ? (
        <ContributionTable
          title="Impact reports"
          rows={ambassador.contributions.filter(
            (contribution) => contribution.kind !== "mission_submission",
          )}
          emptyMessage="No impact reports have been recorded."
        />
      ) : tab === "rewards" ? (
        <Rewards ambassador={ambassador} />
      ) : (
        <Impact ambassador={ambassador} />
      )}
    </div>
  );
}

type AmbassadorData = NonNullable<
  FunctionReturnType<typeof api.ambassadors.adminGet>
>;

function Overview({ ambassador }: { ambassador: AmbassadorData }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
      <Card className="gap-0 border-border p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        <dl className="mt-4 grid gap-x-6 sm:grid-cols-2">
          <Detail label="Location">
            {ambassador.profile?.location ?? "Not provided"}
          </Detail>
          <Detail label="School or community">
            {ambassador.profile?.school ?? "Not provided"}
          </Detail>
          <Detail label="Track">
            {ambassador.profile?.track
              ? MISSION_CATEGORY_LABELS[ambassador.profile.track]
              : "Not assigned"}
          </Detail>
          <Detail label="Pod">
            {ambassador.profile?.podName ?? "Not assigned"}
          </Detail>
          <Detail label="Safety acknowledgement">
            {ambassador.profile?.safetyAcknowledgedAt
              ? dateFormat.format(
                  new Date(ambassador.profile.safetyAcknowledgedAt),
                )
              : "Not recorded"}
          </Detail>
        </dl>
        {ambassador.profile?.bio ? (
          <p className="mt-4 whitespace-pre-wrap break-words border-t border-border pt-4 text-sm leading-6 text-muted-foreground">
            {ambassador.profile.bio}
          </p>
        ) : null}
      </Card>
      <ContributionTable
        title="Recent activity"
        rows={ambassador.contributions.slice(0, 6)}
        emptyMessage="No activity has been recorded."
      />
    </div>
  );
}

function Analytics({ ambassador }: { ambassador: AmbassadorData }) {
  const totals = ambassador.totals;
  return (
    <section
      aria-label="Ambassador analytics"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <MetricCard
        label="Approved contributions"
        value={totals?.contributionsApproved ?? 0}
      />
      <MetricCard
        label="Missions completed"
        value={totals?.missionsCompleted ?? 0}
      />
      <MetricCard label="Total points" value={totals?.points ?? 0} />
      <MetricCard label="Level" value={totals?.levelRank ?? 0} />
      <MetricCard label="People reached" value={totals?.peopleReached ?? 0} />
      <MetricCard label="App installs" value={totals?.installs ?? 0} />
      <MetricCard label="Referrals" value={totals?.referrals ?? 0} />
      <MetricCard label="Events" value={totals?.eventCount ?? 0} />
    </section>
  );
}

function Community({ ambassador }: { ambassador: AmbassadorData }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="gap-2 border-border p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Community group
        </h2>
        <p className="text-sm text-muted-foreground">
          {ambassador.profile?.podName ?? "No pod assigned"}
        </p>
      </Card>
      <Card className="gap-0 border-border p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Events</h2>
        {ambassador.events.length ? (
          <ul className="mt-3 divide-y divide-border">
            {ambassador.events.map((event) => (
              <li key={event._id} className="flex justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {event.title}
                  </span>
                  <time className="text-xs text-muted-foreground">
                    {dateFormat.format(new Date(event.startsAt))}
                  </time>
                </span>
                <Badge variant="outline" className="h-fit capitalize">
                  {event.status}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            No event participation recorded.
          </p>
        )}
      </Card>
    </div>
  );
}

function Rewards({ ambassador }: { ambassador: AmbassadorData }) {
  return (
    <div className="space-y-5">
      <MetricCard
        label="Current points"
        value={ambassador.totals?.points ?? 0}
      />
      <Card className="gap-0 border-border p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Recognition</h2>
        {ambassador.recognitions.length ? (
          <ul className="mt-3 divide-y divide-border">
            {ambassador.recognitions.map((recognition) => (
              <li key={recognition._id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium capitalize text-foreground">
                    {recognition.kind.replaceAll("_", " ")}
                  </p>
                  <time className="text-xs text-muted-foreground">
                    {dateFormat.format(new Date(recognition._creationTime))}
                  </time>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {recognition.note}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            No recognition has been recorded.
          </p>
        )}
      </Card>
      <ContributionTable
        title="Approved contribution rewards"
        rows={ambassador.contributions.filter(
          (contribution) => contribution.status === "approved",
        )}
        emptyMessage="No approved contribution rewards yet."
      />
    </div>
  );
}

function Impact({ ambassador }: { ambassador: AmbassadorData }) {
  const totals = ambassador.totals;
  return (
    <section
      aria-label="Ambassador impact"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
    >
      <MetricCard label="People reached" value={totals?.peopleReached ?? 0} />
      <MetricCard label="App installs" value={totals?.installs ?? 0} />
      <MetricCard label="Referrals" value={totals?.referrals ?? 0} />
      <MetricCard
        label="Content contributions"
        value={totals?.contentCount ?? 0}
      />
      <MetricCard
        label="Events hosted or joined"
        value={totals?.eventCount ?? 0}
      />
    </section>
  );
}

type Contribution = AmbassadorData["contributions"][number];

function ContributionTable({
  title,
  rows,
  emptyMessage,
}: {
  title: string;
  rows: Contribution[];
  emptyMessage: string;
}) {
  return (
    <Card className="min-w-0 gap-0 border-border p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {rows.length ? (
        <Table aria-label={title}>
          <TableHeader>
            <TableRow>
              <TableHead>Contribution</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((contribution) => (
              <TableRow key={contribution._id}>
                <TableCell className="max-w-64">
                  <span className="block truncate font-medium text-foreground">
                    {contribution.missionTitle ?? contribution.title}
                  </span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {contribution.kind.replaceAll("_", " ")}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    className={contributionStatusClass(contribution.status)}
                  >
                    {contribution.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {dateFormat.format(new Date(contribution._creationTime))}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {contribution.awardedPoints ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
        {numberFormat.format(value)}
      </p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="gap-2 border-border p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums text-foreground">
        {numberFormat.format(value)}
      </p>
    </Card>
  );
}

function Detail({ label, children }: { label: string; children: string }) {
  return (
    <div className="min-w-0 border-b border-border py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

function statusClass(status: string) {
  if (status === "active") return "bg-success text-success-foreground";
  if (status === "suspended")
    return "bg-destructive text-destructive-foreground";
  return "bg-warning text-warning-foreground";
}

function contributionStatusClass(status: string) {
  if (status === "approved") return "bg-success text-success-foreground";
  if (status === "declined")
    return "bg-destructive text-destructive-foreground";
  return "bg-warning text-warning-foreground";
}
