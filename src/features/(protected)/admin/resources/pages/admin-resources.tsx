"use client";

import { usePaginatedQuery } from "convex/react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageDescription } from "@/components/shared/page-description";
import {
  ResourceFormDialog,
  type ResourceForm,
} from "../components/resource-form-dialog";
import { ResourceListItem } from "../components/resource-list-item";
import { ResourceDeleteDialog } from "../components/resource-delete-dialog";
import { ResourceListSkeleton } from "../components/resource-list-skeleton";

const PAGE_SIZE = 10;

export default function AdminResources({ uuid }: { uuid: string }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.resources.listAll,
    {},
    { initialNumItems: PAGE_SIZE },
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingResource, setEditingResource] = useState<
    ResourceForm | undefined
  >(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setEditingResource(undefined);
    setDialogOpen(true);
  }

  function openEdit(resource: {
    _id: string;
    title: string;
    description: string;
    category: string;
    kind: string;
    url?: string;
    track?: string;
    published: boolean;
    sortOrder: number;
  }) {
    setEditingId(resource._id);
    setEditingResource({
      title: resource.title,
      description: resource.description,
      category: resource.category as ResourceForm["category"],
      kind: resource.kind as "link" | "file",
      url: resource.url ?? "",
      track: resource.track as ResourceForm["track"],
      published: resource.published,
      sortOrder: resource.sortOrder,
    });
    setDialogOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageDescription page="adminResources" className="max-w-2xl" />
        <Button onClick={openCreate} size="sm" className="shrink-0">
          <Plus aria-hidden="true" />
          New resource
        </Button>
      </div>

      {status === "LoadingFirstPage" ? (
        <ResourceListSkeleton />
      ) : results.length === 0 ? (
        <EmptyState
          title="No resources yet"
          description="Create your first resource to share with ambassadors."
          action={{ label: "Create resource", onClick: openCreate }}
        />
      ) : (
        <>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {results.map((resource) => (
              <ResourceListItem
                key={resource._id}
                uuid={uuid}
                resource={resource}
                onEdit={() => openEdit(resource)}
                onDelete={() => setDeleteId(resource._id)}
              />
            ))}
          </ul>
          {status === "CanLoadMore" || status === "LoadingMore" ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => loadMore(PAGE_SIZE)}
                disabled={status === "LoadingMore"}
              >
                {status === "LoadingMore" ? (
                  "Loading…"
                ) : (
                  <>
                    Load more
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </>
                )}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <ResourceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingId={editingId}
        onSaved={() => setDialogOpen(false)}
        defaultValues={editingResource}
      />

      <ResourceDeleteDialog
        resourceId={deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      />
    </div>
  );
}
