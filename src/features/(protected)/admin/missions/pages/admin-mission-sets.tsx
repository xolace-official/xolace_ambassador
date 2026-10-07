"use client";

import { useMutation, usePaginatedQuery } from "convex/react";
import { MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import {
  MissionSetForm,
  type MissionSetInitialValues,
} from "../components/mission-set-form";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default function AdminMissionSets({ uuid }: { uuid: string }) {
  const PAGE_SIZE = 4;
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<Id<"missionSets"> | null>(null);
  const [editingSet, setEditingSet] = useState<MissionSetInitialValues | null>(
    null,
  );
  const [setFormOpen, setSetFormOpen] = useState(false);
  const deleteMissionSet = useMutation(api.missionSets.adminDelete);
  const adoptLegacyMissions = useMutation(
    api.missionSets.adminAdoptLegacyMissions,
  );
  const { results, status, loadMore } = usePaginatedQuery(
    api.missionSets.adminList,
    {},
    { initialNumItems: 12 },
  );

  useEffect(() => {
    void adoptLegacyMissions({});
  }, [adoptLegacyMissions]);

  useEffect(() => {
    if (
      page > 0 &&
      results.length < (page + 1) * PAGE_SIZE &&
      status === "CanLoadMore"
    ) {
      loadMore(PAGE_SIZE);
    }
  }, [loadMore, page, results.length, status]);

  const visibleResults = results.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );
  const hasNextPage =
    (page + 1) * PAGE_SIZE < results.length || status === "CanLoadMore";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Group missions under one name and shared display schedule.
          </p>
        </div>
        <Button
          type="button"
          size={"sm"}
          onClick={() => {
            setEditingSet(null);
            setSetFormOpen(true);
          }}
        >
          <Plus aria-hidden="true" />
          New set
        </Button>
      </header>

      {status === "LoadingFirstPage" ? (
        <div
          className="h-48 animate-pulse rounded-xl border border-border bg-card"
          aria-hidden="true"
        />
      ) : results.length === 0 ? (
        <EmptyState
          title="No mission sets yet"
          description="Create a set before adding missions for ambassadors."
        />
      ) : (
        <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
          {visibleResults.map((missionSet) => {
            const state = getSetState(
              missionSet.status,
              missionSet.startsAt,
              missionSet.endsAt,
            );

            return (
              <Card
                key={missionSet._id}
                className="group min-w-0 overflow-hidden border-border p-0 transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-md"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`/admin/${uuid}/missions/${missionSet._id}`}
                      className="min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={state.className}>{state.label}</Badge>
                        <Badge variant="outline" className="capitalize">
                          {missionSet.status === "published_next"
                            ? "Published next"
                            : missionSet.status}
                        </Badge>
                      </div>
                      <h2 className="mt-3 truncate text-lg font-semibold tracking-tight text-foreground sm:mt-4 sm:text-xl">
                        {missionSet.name}
                      </h2>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${missionSet.name}`}
                          onPointerDown={(event) => event.stopPropagation()}
                        >
                          <MoreHorizontal aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        onPointerDown={(event) => event.stopPropagation()}
                      >
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/${uuid}/missions/${missionSet._id}`}
                          >
                            View missions
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditingSet(missionSet);
                            setSetFormOpen(true);
                          }}
                        >
                          Edit set
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setDeleteId(missionSet._id)}
                        >
                          Delete set
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {missionSet.description ? (
                    <p className="mt-3 line-clamp-2 break-words text-sm leading-6 text-muted-foreground">
                      {missionSet.description}
                    </p>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border bg-muted/30 px-4 py-3 text-sm sm:grid-cols-3 sm:px-5 sm:py-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Missions</p>
                    <p className="mt-1 font-medium text-foreground">
                      {missionSet.missionCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Due</p>
                    <p className="mt-1 font-medium text-foreground">
                      {dateFormat.format(new Date(missionSet.endsAt))}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs text-muted-foreground">Created by</p>
                    <p className="mt-1 truncate font-medium text-foreground">
                      {missionSet.createdByName}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {results.length > 0 ? (
        <nav
          aria-label="Mission set pages"
          className="flex items-center justify-end gap-2"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <span className="min-w-16 text-center text-sm tabular-nums text-muted-foreground">
            Page {page + 1}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!hasNextPage || status === "LoadingMore"}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </nav>
      ) : null}

      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete mission set?</DialogTitle>
            <DialogDescription>
              A set can only be deleted when it has no missions. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleteId) return;
                void deleteMissionSet({ missionSetId: deleteId })
                  .then(() => {
                    toast.success("Mission set deleted.");
                    setDeleteId(null);
                  })
                  .catch((error: unknown) => {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Could not delete mission set.",
                    );
                  });
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={setFormOpen} onOpenChange={setSetFormOpen}>
        <DialogContent className="inset-x-0 bottom-0 top-auto left-0 max-h-[82dvh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-b-none rounded-t-2xl p-5 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:max-h-[78vh] sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {editingSet ? "Edit mission set" : "Create mission set"}
            </DialogTitle>
            <DialogDescription>
              Set the shared schedule used by every mission in this set.
            </DialogDescription>
          </DialogHeader>
          <MissionSetForm
            uuid={uuid}
            initial={editingSet ?? undefined}
            onSaved={() => setSetFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getSetState(status: string, startsAt: number, endsAt: number) {
  if (status === "closed" || endsAt < Date.now()) {
    return { label: "Expired", className: "bg-muted text-muted-foreground" };
  }
  if (status === "published" && startsAt <= Date.now()) {
    return { label: "Active", className: "bg-success text-success-foreground" };
  }
  return { label: "Scheduled", className: "bg-warning/20 text-foreground" };
}
