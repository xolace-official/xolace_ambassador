"use client";

import { useQuery } from "convex/react";
import { useQueryState } from "nuqs";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import { useEffect, useRef, useState } from "react";
import { PageDescription } from "@/components/shared/page-description";
import { api } from "../../../../../../convex/_generated/api";
import {
  type ColumnDef,
  formatNumber,
  ReportsDynamicTable,
  StatusBadge,
} from "../components/reports-dynamic-table";
import { ReportsFilterBar } from "../components/reports-filter-bar";
import { ReportsSkeleton } from "../components/reports-skeleton";
import { ReportsSummaryCards } from "../components/reports-summary-cards";

const PAGE_SIZE = 8;

export type ReportType =
  | "ambassadors"
  | "missions"
  | "contributions"
  | "resources"
  | "events"
  | "recognitions"
  | "applications";

export type ReportStatus =
  | "all"
  | "active"
  | "paused"
  | "suspended"
  | "draft"
  | "published"
  | "closed"
  | "pending"
  | "approved"
  | "rejected"
  | "declined"
  | "new"
  | "reviewing"
  | "accepted";

const reportTypeOptions: { value: ReportType; label: string }[] = [
  { value: "ambassadors", label: "Ambassadors" },
  { value: "missions", label: "Missions" },
  { value: "contributions", label: "Contributions" },
  { value: "resources", label: "Resources" },
  { value: "events", label: "Events" },
  { value: "recognitions", label: "Recognitions" },
  { value: "applications", label: "Applications" },
];

export interface AmbassadorReportItem {
  userId: string;
  name: string;
  track: string | null;
  status: string;
  points: number;
  contributionsApproved: number;
  missionsCompleted: number;
  peopleReached: number;
  lastActivityAt: number | null;
}

export interface MissionReportItem {
  missionId: string;
  title: string;
  status: string;
  track: string;
  submissions: number;
  approved: number;
  rejected: number;
  pointsAwarded: number;
}

export interface ContributionReportItem {
  contributionId: string;
  ambassadorName: string;
  missionTitle: string | null;
  kind: string;
  status: string;
  quantity: number | null;
  awardedPoints: number | null;
  createdAt: number;
}

export interface ResourceReportItem {
  resourceId: string;
  title: string;
  category: string;
  kind: string;
  published: boolean;
  track: string | null;
}

export interface EventReportItem {
  eventId: string;
  title: string;
  format: string;
  startsAt: number;
  location: string | null;
}

export interface RecognitionReportItem {
  recognitionId: string;
  userName: string;
  kind: string;
  note: string;
  awardedAt: number;
}

export interface ApplicationReportItem {
  applicationId: string;
  name: string;
  email: string;
  trackInterest: string;
  status: string;
  appliedAt: number;
}

export type ReportItem =
  | AmbassadorReportItem
  | MissionReportItem
  | ContributionReportItem
  | ResourceReportItem
  | EventReportItem
  | RecognitionReportItem
  | ApplicationReportItem;

export default function AdminReports({ uuid }: { uuid: string }) {
  const [reportType, setReportType] = useQueryState<ReportType>(
    "reportType",
    parseAsStringLiteral([
      "ambassadors",
      "missions",
      "contributions",
      "resources",
      "events",
      "recognitions",
      "applications",
    ]).withDefault("ambassadors"),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [searchInput, setSearchInput] = useState(search);
  const pendingSearch = useRef<string | null>(null);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [period, setPeriod] = useQueryState(
    "period",
    parseAsStringLiteral(["all", "daily", "weekly", "monthly", "yearly"])
      .withDefault("all")
      .withOptions({ clearOnDefault: true }),
  );
  const [status, setStatus] = useQueryState<ReportStatus>(
    "status",
    parseAsStringLiteral<ReportStatus>([
      "all",
      "active",
      "paused",
      "suspended",
      "draft",
      "published",
      "closed",
      "pending",
      "approved",
      "rejected",
      "declined",
      "new",
      "reviewing",
      "accepted",
    ]).withDefault("all"),
  );

  const reports = useQuery(api.reports.getReports, {
    reportType: reportType ?? undefined,
    search: search || undefined,
    period: period ?? undefined,
    status: status === "all" || !status ? undefined : status,
  });

  useEffect(() => {
    if (pendingSearch.current === search) {
      pendingSearch.current = null;
      return;
    }
    setSearchInput(search);
  }, [search]);
  useEffect(() => {
    const nextSearch = searchInput.trim();
    const timeout = window.setTimeout(() => {
      pendingSearch.current = nextSearch;
      void setSearch(nextSearch || null);
      void setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput, setPage, setSearch]);

  if (reports === undefined) {
    return <ReportsSkeleton />;
  }

  const { summary } = reports;

  const handleReportTypeChange = (type: string) => {
    setReportType(type as ReportType);
    setPage(1);
  };

  const ambassadorColumns: ColumnDef<AmbassadorReportItem>[] = [
    { key: "name", label: "Name", render: (r) => r.name },
    { key: "track", label: "Track", render: (r) => r.track ?? "—" },
    {
      key: "points",
      label: "Points",
      align: "right",
      render: (r) => (
        <span className="font-semibold">{formatNumber(r.points)}</span>
      ),
    },
    {
      key: "contributionsApproved",
      label: "Contributions",
      align: "right",
      render: (r) => formatNumber(r.contributionsApproved),
    },
    {
      key: "missionsCompleted",
      label: "Missions",
      align: "right",
      render: (r) => formatNumber(r.missionsCompleted),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  const missionColumns: ColumnDef<MissionReportItem>[] = [
    { key: "title", label: "Title", render: (r) => r.title },
    { key: "track", label: "Track", render: (r) => r.track },
    {
      key: "submissions",
      label: "Submissions",
      align: "right",
      render: (r) => formatNumber(r.submissions),
    },
    {
      key: "approved",
      label: "Approved",
      align: "right",
      render: (r) => formatNumber(r.approved),
    },
    {
      key: "pointsAwarded",
      label: "Points",
      align: "right",
      render: (r) => (
        <span className="font-semibold">{formatNumber(r.pointsAwarded)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  const contributionColumns: ColumnDef<ContributionReportItem>[] = [
    {
      key: "ambassadorName",
      label: "Ambassador",
      render: (r) => r.ambassadorName,
    },
    {
      key: "missionTitle",
      label: "Mission",
      render: (r) => r.missionTitle ?? "—",
    },
    { key: "kind", label: "Type", render: (r) => r.kind },
    {
      key: "quantity",
      label: "Quantity",
      align: "right",
      render: (r) => formatNumber(r.quantity),
    },
    {
      key: "awardedPoints",
      label: "Points",
      align: "right",
      render: (r) => (
        <span className="font-semibold">{formatNumber(r.awardedPoints)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  const resourceColumns: ColumnDef<ResourceReportItem>[] = [
    { key: "title", label: "Title", render: (r) => r.title },
    { key: "category", label: "Category", render: (r) => r.category },
    { key: "kind", label: "Type", render: (r) => r.kind },
    { key: "track", label: "Track", render: (r) => r.track ?? "—" },
    {
      key: "published",
      label: "Published",
      align: "right",
      render: (r) => (r.published ? "Yes" : "No"),
    },
  ];

  const eventColumns: ColumnDef<EventReportItem>[] = [
    { key: "title", label: "Title", render: (r) => r.title },
    { key: "format", label: "Format", render: (r) => r.format },
    { key: "location", label: "Location", render: (r) => r.location ?? "—" },
    {
      key: "startsAt",
      label: "Starts",
      render: (r) => new Date(r.startsAt).toLocaleDateString(),
    },
  ];

  const recognitionColumns: ColumnDef<RecognitionReportItem>[] = [
    { key: "userName", label: "Ambassador", render: (r) => r.userName },
    { key: "kind", label: "Type", render: (r) => r.kind },
    { key: "note", label: "Note", render: (r) => r.note },
    {
      key: "awardedAt",
      label: "Date",
      render: (r) => new Date(r.awardedAt).toLocaleDateString(),
    },
  ];

  const applicationColumns: ColumnDef<ApplicationReportItem>[] = [
    { key: "name", label: "Name", render: (r) => r.name },
    { key: "email", label: "Email", render: (r) => r.email },
    { key: "trackInterest", label: "Track", render: (r) => r.trackInterest },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "appliedAt",
      label: "Applied",
      render: (r) => new Date(r.appliedAt).toLocaleDateString(),
    },
  ];

  const getActiveRows = (): ReportItem[] => {
    switch (reportType) {
      case "ambassadors":
        return reports.ambassadors;
      case "missions":
        return reports.missions;
      case "contributions":
        return reports.contributions;
      case "resources":
        return reports.resources;
      case "events":
        return reports.events;
      case "recognitions":
        return reports.recognitions;
      case "applications":
        return reports.applications;
      default:
        return [];
    }
  };

  const currentRows = getActiveRows();

  const SENSITIVE_KEYS = new Set([
    "userId",
    "missionId",
    "contributionId",
    "resourceId",
    "eventId",
    "recognitionId",
    "applicationId",
  ]);

  function exportExcel() {
    if (currentRows.length === 0) return;
    const firstRow = currentRows[0];
    const exportKeys = (
      Object.keys(firstRow) as (keyof typeof firstRow)[]
    ).filter((k) => !SENSITIVE_KEYS.has(k as string));
    const headers = exportKeys.join(",");
    const csvRows = currentRows.map((row) =>
      exportKeys
        .map((k) => {
          const val = row[k];
          const str = val === null || val === undefined ? "" : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(","),
    );
    const csv = [headers, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const handleExportRow = (row: ReportItem) => {
    const csv = Object.entries(row)
      .filter(([k]) => !SENSITIVE_KEYS.has(k))
      .map(
        ([k, v]) =>
          `"${k}","${v === null || v === undefined ? "" : String(v).replace(/"/g, '""')}"`,
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType}-row.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const originalTitle = document.title;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    document.title = `${reportType}-report-${dateStr}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const renderTable = () => {
    switch (reportType) {
      case "ambassadors":
        return (
          <ReportsDynamicTable<AmbassadorReportItem>
            columns={ambassadorColumns}
            rows={reports.ambassadors}
            rowId={(r) => r.userId}
            page={page}
            onPageChange={(nextPage) => void setPage(nextPage)}
            onViewDetails={(row) => {
              window.location.href = `/admin/${uuid}/ambassadors/${row.userId}`;
            }}
            onExportRow={handleExportRow}
            pageSize={PAGE_SIZE}
          />
        );
      case "missions":
        return (
          <ReportsDynamicTable<MissionReportItem>
            columns={missionColumns}
            rows={reports.missions}
            rowId={(r) => r.missionId}
            page={page}
            onPageChange={(nextPage) => void setPage(nextPage)}
            onViewDetails={(row) => {
              window.location.href = `/admin/${uuid}/missions/${row.missionId}`;
            }}
            onExportRow={handleExportRow}
            pageSize={PAGE_SIZE}
          />
        );
      case "contributions":
        return (
          <ReportsDynamicTable<ContributionReportItem>
            columns={contributionColumns}
            rows={reports.contributions}
            rowId={(r) => r.contributionId}
            page={page}
            onPageChange={(nextPage) => void setPage(nextPage)}
            onViewDetails={(row) => {
              window.location.href = `/admin/${uuid}/missions/submissions/${row.contributionId}`;
            }}
            onExportRow={handleExportRow}
            pageSize={PAGE_SIZE}
          />
        );
      case "resources":
        return (
          <ReportsDynamicTable<ResourceReportItem>
            columns={resourceColumns}
            rows={reports.resources}
            rowId={(r) => r.resourceId}
            page={page}
            onPageChange={(nextPage) => void setPage(nextPage)}
            onViewDetails={(_row) => {
              window.location.href = `/admin/${uuid}/resources`;
            }}
            onExportRow={handleExportRow}
            pageSize={PAGE_SIZE}
          />
        );
      case "events":
        return (
          <ReportsDynamicTable<EventReportItem>
            columns={eventColumns}
            rows={reports.events}
            rowId={(r) => r.eventId}
            page={page}
            onPageChange={(nextPage) => void setPage(nextPage)}
            onViewDetails={(_row) => {
              window.location.href = `/admin/${uuid}/events`;
            }}
            onExportRow={handleExportRow}
            pageSize={PAGE_SIZE}
          />
        );
      case "recognitions":
        return (
          <ReportsDynamicTable<RecognitionReportItem>
            columns={recognitionColumns}
            rows={reports.recognitions}
            rowId={(r) => r.recognitionId}
            page={page}
            onPageChange={(nextPage) => void setPage(nextPage)}
            onViewDetails={(_row) => {
              window.location.href = `/admin/${uuid}/ambassadors`;
            }}
            onExportRow={handleExportRow}
            pageSize={PAGE_SIZE}
          />
        );
      case "applications":
        return (
          <ReportsDynamicTable<ApplicationReportItem>
            columns={applicationColumns}
            rows={reports.applications}
            rowId={(r) => r.applicationId}
            page={page}
            onPageChange={(nextPage) => void setPage(nextPage)}
            onViewDetails={(row) => {
              window.location.href = `/admin/${uuid}/ambassadors/applications/${row.applicationId}`;
            }}
            onExportRow={handleExportRow}
            pageSize={PAGE_SIZE}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageDescription page="adminReports" className="max-w-2xl" />
      </div>

      <ReportsSummaryCards
        totalAmbassadors={summary.totalAmbassadors}
        totalPoints={summary.totalPoints}
        totalContributions={summary.totalContributions}
      />

      <ReportsFilterBar
        reportType={reportType}
        onReportTypeChange={handleReportTypeChange}
        reportTypeOptions={reportTypeOptions}
        search={searchInput}
        onSearchChange={(v) => {
          setSearchInput(v);
        }}
        period={period}
        onPeriodChange={(value) => {
          void setPeriod(
            value as "all" | "daily" | "weekly" | "monthly" | "yearly",
          );
          void setPage(1);
        }}
        status={status}
        onStatusChange={(value) => {
          void setStatus(value as ReportStatus);
          void setPage(1);
        }}
        onExportPdf={handleExportPdf}
        onExportExcel={exportExcel}
      />

      {renderTable()}
    </div>
  );
}
