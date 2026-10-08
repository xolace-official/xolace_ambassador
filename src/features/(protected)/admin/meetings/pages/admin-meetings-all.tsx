"use client";

import { usePaginatedQuery } from "convex/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryState } from "nuqs";
import { parseAsStringLiteral } from "nuqs/server";
import { useEffect, useState } from "react";
import { PageDescription } from "@/components/shared/page-description";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { api } from "../../../../../../convex/_generated/api";

const STATUSES = ["all", "new", "reviewing", "accepted", "rejected"] as const;
const PAGE_SIZE = 10;

export function AdminMeetingsAll() {
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(STATUSES).withDefault("all"),
  );
  const {
    results,
    status: loadStatus,
    loadMore,
  } = usePaginatedQuery(
    api.meetings.adminAllMeetings,
    { status: status === "all" ? undefined : status },
    { initialNumItems: PAGE_SIZE },
  );
  const [page, setPage] = useState(1);
  const [pendingPage, setPendingPage] = useState<number | null>(null);

  useEffect(() => {
    if (
      pendingPage !== null &&
      (results.length >= pendingPage * PAGE_SIZE || loadStatus === "Exhausted")
    ) {
      setPage(pendingPage);
      setPendingPage(null);
    }
  }, [pendingPage, results.length, loadStatus]);

  const visibleRows = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const canGoNext =
    loadStatus === "CanLoadMore" || page * PAGE_SIZE < results.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageDescription page="adminMeetingsAll" className="max-w-2xl" />
        <Select
          value={status}
          onValueChange={(value) => {
            setPage(1);
            setPendingPage(null);
            void setStatus(value as (typeof STATUSES)[number]);
          }}
        >
          <SelectTrigger
            className="w-full sm:w-44"
            aria-label="Filter meetings by status"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">Submitted</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <Table aria-label="All scheduled meetings">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Ambassador</TableHead>
              <TableHead className="hidden sm:table-cell">
                Meeting time
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((meeting) => (
              <TableRow key={meeting._id}>
                <TableCell className="max-w-56">
                  <span className="block truncate font-medium text-foreground">
                    {meeting.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {meeting.email}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {meeting.meetingSlotLabel ?? "No slot"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {meeting.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <div className="flex flex-col items-center gap-1 py-10 text-center">
                    <CalendarDays
                      aria-hidden="true"
                      className="size-6 text-muted-foreground"
                    />
                    <p className="text-sm text-muted-foreground">
                      No meetings match this filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>

      <nav
        aria-label="Meetings pagination"
        className="flex items-center justify-end gap-3"
      >
        <span className="text-sm tabular-nums text-muted-foreground">
          Page {page}
          {loadStatus === "Exhausted"
            ? ` / ${Math.max(1, Math.ceil(results.length / PAGE_SIZE))}`
            : ""}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label="Previous page"
          disabled={page === 1 || loadStatus === "LoadingMore"}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          Prev
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label="Next page"
          disabled={!canGoNext || loadStatus === "LoadingMore"}
          onClick={() => {
            if (results.length >= page * PAGE_SIZE + PAGE_SIZE) {
              setPage(page + 1);
              return;
            }
            setPendingPage(page + 1);
            loadMore(PAGE_SIZE);
          }}
        >
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </nav>
    </div>
  );
}
