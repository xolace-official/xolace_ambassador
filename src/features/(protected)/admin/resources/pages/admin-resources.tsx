"use client";

import { usePaginatedQuery } from "convex/react";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageDescription } from "@/components/shared/page-description";
import { Button } from "@/components/ui/button";
import { api } from "../../../../../../convex/_generated/api";
import { ResourceDeleteDialog } from "../components/resource-delete-dialog";
import { ResourceListItem } from "../components/resource-list-item";
import { ResourceListSkeleton } from "../components/resource-list-skeleton";

const PAGE_SIZE = 10;

export default function AdminResources({ uuid }: { uuid: string }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.resources.listAll,
    {},
    { initialNumItems: PAGE_SIZE },
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex gap-4 flex-row items-start justify-between">
        <PageDescription page="adminResources" className="max-w-2xl" />
        <Button asChild size="sm" className="shrink-0 w-fit">
          <Link href={`/admin/${uuid}/resources/new`}>
            <Plus aria-hidden="true" />
            New resource
          </Link>
        </Button>
      </div>

      {status === "LoadingFirstPage" ? (
        <ResourceListSkeleton />
      ) : results.length === 0 ? (
        <EmptyState
          title="No resources yet"
          description="Create your first resource to share with ambassadors."
          action={{
            label: "Create resource",
            onClick: () => {
              window.location.href = `/admin/${uuid}/resources/new`;
            },
          }}
        />
      ) : (
        <>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {results.map((resource) => (
              <ResourceListItem
                key={resource._id}
                uuid={uuid}
                resource={resource}
                onDelete={() => setDeleteId(resource._id)}
              />
            ))}
          </ul>
          {status === "CanLoadMore" || status === "LoadingMore" ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
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

      <ResourceDeleteDialog
        resourceId={deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      />
    </div>
  );
}
