"use client";

import { useQuery } from "convex/react";
import { useQueryState } from "nuqs";
import { parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs/server";
import { PageDescription } from "@/components/shared/page-description";
import { api } from "../../../../../../convex/_generated/api";
import { ReportsDynamicTable, StatusBadge, formatNumber } from "../components/reports-dynamic-table";
import { ReportsFilterBar } from "../components/reports-filter-bar";
import { ReportsSkeleton } from "../components/reports-skeleton";
import { ReportsSummaryCards } from "../components/reports-summary-cards";

const PAGE_SIZE = 8;

const reportTypeOptions = [
  { value: "ambassadors", label: "Ambassadors" },
  { value: "missions", label: "Missions" },
  { value: "contributions", label: "Contributions" },
  { value: "resources", label: "Resources" },
  { value: "events", label: "Events" },
  { value: "recognitions", label: "Recognitions" },
  { value: "applications", label: "Applications" },
];

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminReports() {
  const [reportType, setReportType] = useQueryState(
    "reportType",
    parseAsStringLiteral(["ambassadors", "missions", "contributions", "resources", "events", "recognitions", "applications"]).withDefault("ambassadors"),
  );
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const reports = useQuery(api.reports.getReports, {
    reportType,
    search: search || undefined,
  });

  if (reports === undefined) {
    return <ReportsSkeleton />;
  }

  const { summary } = reports;

  const handleReportTypeChange = (type: string) => {
    setReportType(type as any);
    setPage(1);
  };

  const tableColumns: Record<string, { key: string; label: string; align?: "left" | "right"; render: (row: any) => React.ReactNode }[]> = {
    ambassadors: [
      { key: "name", label: "Name", render: (r: any) => r.name },
      { key: "track", label: "Track", render: (r: any) => r.track ?? "—" },
      { key: "points", label: "Points", align: "right", render: (r: any) => <span className="font-semibold">{formatNumber(r.points)}</span> },
      { key: "contributions", label: "Contributions", align: "right", render: (r: any) => formatNumber(r.contributionsApproved) },
      { key: "missions", label: "Missions", align: "right", render: (r: any) => formatNumber(r.missionsCompleted) },
      { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
    ],
    missions: [
      { key: "title", label: "Title", render: (r: any) => r.title },
      { key: "track", label: "Track", render: (r: any) => r.track },
      { key: "submissions", label: "Submissions", align: "right", render: (r: any) => formatNumber(r.submissions) },
      { key: "approved", label: "Approved", align: "right", render: (r: any) => formatNumber(r.approved) },
      { key: "points", label: "Points", align: "right", render: (r: any) => <span className="font-semibold">{formatNumber(r.pointsAwarded)}</span> },
      { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
    ],
    contributions: [
      { key: "ambassador", label: "Ambassador", render: (r: any) => r.ambassadorName },
      { key: "mission", label: "Mission", render: (r: any) => r.missionTitle ?? "—" },
      { key: "kind", label: "Type", render: (r: any) => r.kind },
      { key: "quantity", label: "Quantity", align: "right", render: (r: any) => formatNumber(r.quantity) },
      { key: "points", label: "Points", align: "right", render: (r: any) => <span className="font-semibold">{formatNumber(r.awardedPoints)}</span> },
      { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
    ],
    resources: [
      { key: "title", label: "Title", render: (r: any) => r.title },
      { key: "category", label: "Category", render: (r: any) => r.category },
      { key: "kind", label: "Type", render: (r: any) => r.kind },
      { key: "track", label: "Track", render: (r: any) => r.track ?? "—" },
      { key: "published", label: "Published", align: "right", render: (r: any) => r.published ? "Yes" : "No" },
    ],
    events: [
      { key: "title", label: "Title", render: (r: any) => r.title },
      { key: "format", label: "Format", render: (r: any) => r.format },
      { key: "location", label: "Location", render: (r: any) => r.location ?? "—" },
      { key: "startsAt", label: "Starts", render: (r: any) => new Date(r.startsAt).toLocaleDateString() },
    ],
    recognitions: [
      { key: "name", label: "Ambassador", render: (r: any) => r.userName },
      { key: "kind", label: "Type", render: (r: any) => r.kind },
      { key: "note", label: "Note", render: (r: any) => r.note },
      { key: "awardedAt", label: "Date", render: (r: any) => new Date(r.awardedAt).toLocaleDateString() },
    ],
    applications: [
      { key: "name", label: "Name", render: (r: any) => r.name },
      { key: "email", label: "Email", render: (r: any) => r.email },
      { key: "track", label: "Track", render: (r: any) => r.trackInterest },
      { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
      { key: "appliedAt", label: "Applied", render: (r: any) => new Date(r.appliedAt).toLocaleDateString() },
    ],
  };

  const tableData: Record<string, any[]> = {
    ambassadors: reports.ambassadors,
    missions: reports.missions,
    contributions: reports.contributions,
    resources: reports.resources,
    events: reports.events,
    recognitions: reports.recognitions,
    applications: reports.applications,
  };

  const rowIdFn = (row: any) =>
    row.userId || row.missionId || row.contributionId || row.resourceId || row.eventId || row.recognitionId || row.applicationId;

  return (
    <div className="space-y-6">
      <PageDescription page="adminReports" className="max-w-2xl" />

      <ReportsSummaryCards
        totalAmbassadors={summary.totalAmbassadors}
        totalPoints={summary.totalPoints}
        totalContributions={summary.totalContributions}
      />

      <ReportsFilterBar
        reportType={reportType}
        onReportTypeChange={handleReportTypeChange}
        reportTypeOptions={reportTypeOptions}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
      />

      <ReportsDynamicTable
        columns={tableColumns[reportType]}
        rows={tableData[reportType]}
        rowId={rowIdFn}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
