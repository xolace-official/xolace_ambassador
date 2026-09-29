"use client";

import { useMutation, usePaginatedQuery } from "convex/react";
import {
  ChevronLeft,
  ChevronRight,
  ListFilter,
  MoreHorizontal,
  Search,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { parseAsString, parseAsStringLiteral } from "nuqs/server";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { InviteDialog } from "@/components/layout/invite-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageDescription } from "@/components/shared/page-description";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Id } from "../../../../../../convex/_generated/dataModel";

const PEOPLE_TABS = ["ambassadors", "applications"] as const;
const parsePeopleTab = parseAsStringLiteral(PEOPLE_TABS)
  .withDefault("ambassadors")
  .withOptions({ clearOnDefault: true });
const parseSearch = parseAsString.withDefault("").withOptions({
  clearOnDefault: true,
});
const APPLICATION_STATUSES = [
  "all",
  "new",
  "reviewing",
  "accepted",
  "rejected",
] as const;
const AMBASSADOR_STATUSES = ["all", "active", "paused", "suspended"] as const;

export default function AdminAmbassadors({ uuid }: { uuid: string }) {
  const [tab, setTab] = useQueryState("view", parsePeopleTab);

  return (
    <div className="flex flex-col gap-2">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageDescription
          page="adminAmbassadors"
          className="max-w-2xl text-sm"
        />
        <InviteDialog triggerLabel="Invite an ambassador" />
      </header>

      <nav
        aria-label="Ambassador lists"
        className="flex gap-6 border-b border-border"
      >
        {PEOPLE_TABS.map((value) => (
          <button
            key={value}
            type="button"
            aria-current={tab === value ? "page" : undefined}
            onClick={() => void setTab(value)}
            className={`min-h-11 border-b-2 px-1 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              tab === value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {value === "applications" ? "Applications" : "Ambassadors"}
          </button>
        ))}
      </nav>

      {tab === "applications" ? (
        <ApplicationsTable uuid={uuid} />
      ) : (
        <AmbassadorsTable uuid={uuid} />
      )}
    </div>
  );
}

function ApplicationsTable({ uuid }: { uuid: string }) {
  const [statusFilter, setStatusFilter] = useQueryState(
    "applicationStatus",
    parseAsStringLiteral(APPLICATION_STATUSES)
      .withDefault("all")
      .withOptions({ clearOnDefault: true }),
  );
  const { search, searchInput, setSearchInput } = usePeopleSearch();
  const { results, status, loadMore } = usePaginatedQuery(
    api.applications.adminList,
    {
      status: statusFilter === "all" ? undefined : statusFilter,
      search: search || undefined,
    },
    { initialNumItems: 10 },
  );
  const pagination = useTablePagination(results, status, loadMore);

  if (status === "LoadingFirstPage") return <PeopleTableSkeleton />;
  if (
    results.length === 0 &&
    status === "Exhausted" &&
    !search &&
    statusFilter === "all"
  ) {
    return (
      <EmptyState
        icon={UserRound}
        title={
          search || statusFilter !== "all"
            ? "No applications found"
            : "No applications yet"
        }
        description={
          search || statusFilter !== "all"
            ? "Try another search or status filter."
            : "Website applications will appear here when someone applies to join the ambassador program."
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="hidden text-sm text-muted-foreground sm:block">
          Showing {pagination.visibleRows.length} of {results.length} loaded
          applications
        </p>
        <TableControls
          search={searchInput}
          onSearchChange={(value) => {
            pagination.reset();
            setSearchInput(value);
          }}
          filter={
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                pagination.reset();
                void setStatusFilter(
                  value as (typeof APPLICATION_STATUSES)[number],
                );
              }}
            >
              <SelectTrigger
                aria-label="Filter applications by status"
                className="w-full sm:w-44"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="new">Submitted</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Declined</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </div>
      <Table
        aria-label="Ambassador applications"
        className="[&_td]:px-3 [&_td]:py-2 [&_th]:px-3"
      >
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead className="hidden md:table-cell">Track</TableHead>
            <TableHead className="hidden lg:table-cell">Location</TableHead>
            <TableHead className="hidden sm:table-cell">Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24 text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:last-child]:border-b">
          {pagination.visibleRows.map((application) => (
            <TableRow key={application._id}>
              <TableCell className="max-w-56">
                <Link
                  href={`/admin/${uuid}/ambassadors/applications/${application._id}?view=applications`}
                  className="block truncate font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {application.name}
                </Link>
                <span className="block truncate text-xs text-muted-foreground">
                  {application.email}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {MISSION_CATEGORY_LABELS[application.trackInterest]}
              </TableCell>
              <TableCell className="hidden max-w-40 truncate lg:table-cell">
                {application.location}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {dateFormat.format(new Date(application._creationTime))}
              </TableCell>
              <TableCell>
                <ApplicationStatus status={application.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="ghost" className="min-h-11">
                  <Link
                    href={`/admin/${uuid}/ambassadors/applications/${application._id}?view=applications`}
                    aria-label={`View ${application.name}'s application`}
                  >
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {pagination.visibleRows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No applications match these filters.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      <TablePagination {...pagination.controls} />
    </div>
  );
}

function AmbassadorsTable({ uuid }: { uuid: string }) {
  const [statusFilter, setStatusFilter] = useQueryState(
    "ambassadorStatus",
    parseAsStringLiteral(AMBASSADOR_STATUSES)
      .withDefault("all")
      .withOptions({ clearOnDefault: true }),
  );
  const { search, searchInput, setSearchInput } = usePeopleSearch();
  const { results, status, loadMore } = usePaginatedQuery(
    api.ambassadors.adminList,
    {
      status: statusFilter === "all" ? undefined : statusFilter,
      search: search || undefined,
    },
    { initialNumItems: 10 },
  );
  const pagination = useTablePagination(results, status, loadMore);

  if (status === "LoadingFirstPage") return <PeopleTableSkeleton />;
  if (
    results.length === 0 &&
    status === "Exhausted" &&
    !search &&
    statusFilter === "all"
  ) {
    return (
      <EmptyState
        icon={UserRound}
        title={
          search || statusFilter !== "all"
            ? "No ambassadors found"
            : "No ambassadors yet"
        }
        description={
          search || statusFilter !== "all"
            ? "Try another search or status filter."
            : "Active ambassador accounts will appear here after they are provisioned."
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="hidden text-sm text-muted-foreground sm:block">
          Showing {pagination.visibleRows.length} of {results.length} loaded
          ambassadors
        </p>
        <TableControls
          search={searchInput}
          onSearchChange={(value) => {
            pagination.reset();
            setSearchInput(value);
          }}
          filter={
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                pagination.reset();
                void setStatusFilter(
                  value as (typeof AMBASSADOR_STATUSES)[number],
                );
              }}
            >
              <SelectTrigger
                aria-label="Filter ambassadors by status"
                className="w-full sm:w-44"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </div>
      <Table
        aria-label="Active ambassadors"
        className="[&_td]:px-3 [&_td]:py-2 [&_th]:px-3"
      >
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Ambassador</TableHead>
            <TableHead className="hidden md:table-cell">Track</TableHead>
            <TableHead className="hidden lg:table-cell">Pod</TableHead>
            <TableHead>Points</TableHead>
            <TableHead className="hidden sm:table-cell">Missions</TableHead>
            <TableHead className="hidden xl:table-cell">
              Last activity
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:last-child]:border-b">
          {pagination.visibleRows.map((ambassador) => (
            <TableRow key={ambassador._id}>
              <TableCell className="max-w-56">
                <Link
                  href={`/admin/${uuid}/ambassadors/${ambassador._id}`}
                  className="block truncate font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {ambassador.name ?? "Ambassador"}
                </Link>
                <span className="block truncate text-xs text-muted-foreground">
                  {ambassador.email ?? "No email on file"}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {ambassador.track
                  ? MISSION_CATEGORY_LABELS[ambassador.track]
                  : "—"}
              </TableCell>
              <TableCell className="hidden max-w-36 truncate lg:table-cell">
                {ambassador.podName ?? "—"}
              </TableCell>
              <TableCell className="tabular-nums">
                {numberFormat.format(ambassador.points)}
              </TableCell>
              <TableCell className="hidden tabular-nums sm:table-cell">
                {numberFormat.format(ambassador.missionsCompleted)}
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                {ambassador.lastActivityAt
                  ? dateFormat.format(new Date(ambassador.lastActivityAt))
                  : "No activity yet"}
              </TableCell>
              <TableCell>
                <AmbassadorStatus status={ambassador.status} />
              </TableCell>
              <TableCell className="text-right">
                <AmbassadorActions
                  ambassadorId={ambassador._id}
                  name={ambassador.name ?? "Ambassador"}
                  status={ambassador.status}
                  href={`/admin/${uuid}/ambassadors/${ambassador._id}`}
                />
              </TableCell>
            </TableRow>
          ))}
          {pagination.visibleRows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground"
              >
                No ambassadors match these filters.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      <TablePagination {...pagination.controls} />
    </div>
  );
}

function AmbassadorActions({
  ambassadorId,
  name,
  status,
  href,
}: {
  ambassadorId: Id<"users">;
  name: string;
  status: "active" | "paused" | "suspended";
  href: string;
}) {
  const setStatus = useMutation(api.ambassadors.adminSetStatus);

  async function updateStatus(nextStatus: "active" | "paused" | "suspended") {
    if (
      nextStatus === "suspended" &&
      !window.confirm(`Suspend ${name}’s ambassador access?`)
    ) {
      return;
    }

    try {
      await setStatus({ ambassadorId, status: nextStatus });
      toast.success(
        nextStatus === "active"
          ? `${name}’s account is active.`
          : nextStatus === "paused"
            ? `${name}’s account is paused.`
            : `${name}’s ambassador access is suspended.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update the account.",
      );
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-10"
          aria-label={`Actions for ${name}`}
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" collisionPadding={4}>
        <DropdownMenuItem asChild>
          <Link href={href}>View overview</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {status === "active" ? (
          <>
            <DropdownMenuItem onSelect={() => void updateStatus("paused")}>
              Pause account
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => void updateStatus("suspended")}
              className="text-destructive focus:text-destructive"
            >
              Suspend access
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onSelect={() => void updateStatus("active")}>
            Reactivate account
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ApplicationStatus({
  status,
}: {
  status: "new" | "reviewing" | "accepted" | "rejected";
}) {
  const label = {
    new: "Submitted",
    reviewing: "Reviewing",
    accepted: "Accepted",
    rejected: "Declined",
  }[status];

  const className =
    status === "accepted"
      ? "bg-success text-success-foreground"
      : status === "rejected"
        ? "bg-muted text-muted-foreground"
        : "bg-warning text-warning-foreground";

  return <Badge className={`capitalize ${className}`}>{label}</Badge>;
}

function AmbassadorStatus({
  status,
}: {
  status: "active" | "paused" | "suspended";
}) {
  const className =
    status === "active"
      ? "bg-success text-success-foreground"
      : status === "suspended"
        ? "bg-destructive text-destructive-foreground"
        : "bg-warning text-warning-foreground";

  return <Badge className={`capitalize ${className}`}>{status}</Badge>;
}

function usePeopleSearch() {
  const [search, setSearch] = useQueryState("search", parseSearch);
  const [searchInput, setSearchInput] = useState(search);
  const localSearch = useRef<string | null>(null);

  useEffect(() => {
    if (localSearch.current === search) {
      localSearch.current = null;
      return;
    }
    setSearchInput(search);
  }, [search]);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = searchInput.trim() || null;
      localSearch.current = nextSearch;
      void setSearch(nextSearch);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput, setSearch]);

  return { search, searchInput, setSearchInput };
}

function TableControls({
  search,
  onSearchChange,
  filter,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filter: ReactNode;
}) {
  const [mobileMode, setMobileMode] = useState<"search" | "filter">("search");
  const searchField = (
    <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        aria-label="Search by name"
        className="h-10 pl-9"
        placeholder="Search by name…"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
  );

  return (
    <div className="w-full sm:w-auto">
      <div className="hidden items-center justify-end gap-2 sm:flex">
        {searchField}
        <div className="w-44">{filter}</div>
      </div>
      <div className="flex w-full items-center justify-end gap-2 sm:hidden">
        {mobileMode === "search" ? (
          <>
            {searchField}
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Show filters"
              onClick={() => setMobileMode("filter")}
            >
              <ListFilter aria-hidden="true" className="size-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1">{filter}</div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Show search"
              onClick={() => setMobileMode("search")}
            >
              <Search aria-hidden="true" className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function useTablePagination<T>(
  results: T[],
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted",
  loadMore: (numItems: number) => void,
) {
  const [page, setPage] = useState(1);
  const [pendingPage, setPendingPage] = useState<number | null>(null);

  useEffect(() => {
    if (
      pendingPage !== null &&
      (results.length >= pendingPage * 10 || status === "Exhausted")
    ) {
      setPage(pendingPage);
      setPendingPage(null);
    }
  }, [pendingPage, results.length, status]);

  const totalPages =
    status === "Exhausted"
      ? Math.max(1, Math.ceil(results.length / 10))
      : `${Math.max(page + 1, 2)}+`;
  const visibleRows = results.slice((page - 1) * 10, page * 10);

  function nextPage() {
    if (results.length >= page * 10 + 10) {
      setPage(page + 1);
      return;
    }
    if (status === "CanLoadMore") {
      setPendingPage(page + 1);
      loadMore(10);
    }
  }

  return {
    visibleRows,
    reset: () => {
      setPage(1);
      setPendingPage(null);
    },
    controls: {
      page,
      totalPages,
      canGoNext: status === "CanLoadMore" || page * 10 < results.length,
      loading: status === "LoadingMore",
      onPrevious: () => setPage((current) => Math.max(1, current - 1)),
      onNext: nextPage,
    },
  };
}

function TablePagination({
  page,
  totalPages,
  canGoNext,
  loading,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number | string;
  canGoNext: boolean;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <nav
      aria-label="Table pagination"
      className="flex items-center justify-end gap-3 pt-1"
    >
      <span className="text-sm tabular-nums text-muted-foreground">
        Page {page} / {totalPages}
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-label="Previous page"
        disabled={page === 1 || loading}
        onClick={onPrevious}
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Prev
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-label="Next page"
        disabled={!canGoNext || loading}
        onClick={onNext}
      >
        Next
        <ChevronRight aria-hidden="true" className="size-4" />
      </Button>
    </nav>
  );
}

function PeopleTableSkeleton() {
  return (
    <output className="block space-y-3" aria-label="Loading people">
      {["one", "two", "three", "four", "five", "six"].map((row) => (
        <div
          key={row}
          aria-hidden="true"
          className="h-14 animate-pulse rounded-md bg-card"
        />
      ))}
    </output>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const numberFormat = new Intl.NumberFormat("en-GB");
