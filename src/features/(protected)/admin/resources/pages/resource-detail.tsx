"use client";

import { useQuery } from "convex/react";
import { ExternalLink } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  categoryLabel,
  trackLabel,
} from "../components/resource-form-dialog";

export default function AdminResourceDetail({
  resourceId,
}: {
  resourceId: string;
}) {
  const resource = useQuery(api.resources.getById, { resourceId });

  if (resource === undefined) {
    return (
      <div className="space-y-5" aria-label="Loading resource">
        <div
          aria-hidden="true"
          className="h-32 animate-pulse rounded-xl bg-card"
        />
      </div>
    );
  }

  if (resource === null) {
    return (
      <EmptyState
        title="Resource not found"
        description="This resource may have been removed or the link may be incorrect."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 pb-10">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{categoryLabel[resource.category]}</Badge>
          <Badge variant="outline">{resource.kind}</Badge>
          {resource.track ? (
            <Badge variant="outline">{trackLabel[resource.track]}</Badge>
          ) : null}
          <Badge
            className={
              resource.published
                ? "bg-success text-success-foreground"
                : "bg-muted text-muted-foreground"
            }
          >
            {resource.published ? "Published" : "Draft"}
          </Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {resource.title}
        </h1>
      </div>

      <Card className="border-border p-6">
        <h2 className="text-sm font-semibold text-foreground">Description</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {resource.description}
        </p>

        {resource.kind === "link" && resource.url ? (
          <div className="mt-6 border-t border-border pt-5">
            <h2 className="text-sm font-semibold text-foreground">Link</h2>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ExternalLink aria-hidden="true" className="size-4" />
              Open resource
            </a>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
