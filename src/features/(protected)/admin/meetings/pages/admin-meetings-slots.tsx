"use client";

import { useMutation, useQuery } from "convex/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageDescription } from "@/components/shared/page-description";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "../../../../../../convex/_generated/api";
import { AddSlotDialog } from "../components/add-slot-dialog";

const PAGE_SIZE = 10;

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function AdminMeetingsSlots() {
  const slots = useQuery(api.meetings.adminListSlots);
  const toggleSlot = useMutation(api.meetings.adminToggleSlot);
  const [page, setPage] = useState(1);

  const all = slots ?? [];
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const visibleRows = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageDescription page="adminMeetingsSlots" className="max-w-2xl" />
        <AddSlotDialog />
      </header>

      <Card className="gap-0 overflow-hidden p-0">
        <Table aria-label="All meeting slots">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Meeting time (UTC)</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="w-28 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((slot) => (
              <TableRow key={slot._id}>
                <TableCell>
                  {dateFormat.format(new Date(slot.startsAt))}
                </TableCell>
                <TableCell>
                  {slot.booked ? (
                    <Badge variant="secondary">Booked</Badge>
                  ) : slot.active ? (
                    <Badge variant="outline">Open</Badge>
                  ) : (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={slot.booked}
                    onClick={() => {
                      void toggleSlot({
                        slotId: slot._id,
                        active: !slot.active,
                      }).catch((error: unknown) => {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : "Could not update the slot.",
                        );
                      });
                    }}
                  >
                    {slot.active ? "Disable" : "Enable"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    No meeting slots yet. Add availability to get started.
                  </p>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>

      <nav
        aria-label="Slots pagination"
        className="flex items-center justify-end gap-3"
      >
        <span className="text-sm tabular-nums text-muted-foreground">
          Page {page} / {totalPages}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label="Previous page"
          disabled={page === 1}
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
          disabled={page >= totalPages}
          onClick={() =>
            setPage((current) => Math.min(totalPages, current + 1))
          }
        >
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </nav>
    </div>
  );
}
