"use client";

import { useQuery } from "convex/react";
import { BookOpen, Download, ExternalLink, FileText, Image, Search } from "lucide-react";
import { useQueryState } from "nuqs";
import { parseAsString, parseAsStringLiteral } from "nuqs/server";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageDescription } from "@/components/shared/page-description";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

const CATEGORIES = [
  "brand_kit",
  "templates",
  "videos",
  "campaign_assets",
  "captions",
  "screenshots",
  "guide",
] as const;

const parseCategory = parseAsStringLiteral(CATEGORIES)
  .withDefault("brand_kit")
  .withOptions({ clearOnDefault: true });

const parseSearch = parseAsString.withDefault("").withOptions({
  clearOnDefault: true,
});

const categoryLabel: Record<string, string> = {
  brand_kit: "Brand Kit",
  templates: "Templates",
  videos: "Videos",
  campaign_assets: "Campaign Assets",
  captions: "Captions",
  screenshots: "Screenshots",
  guide: "Guides",
};

const categoryIcon: Record<string, typeof FileText> = {
  brand_kit: Image,
  templates: FileText,
  videos: BookOpen,
  campaign_assets: Image,
  captions: FileText,
  screenshots: Image,
  guide: BookOpen,
};

export default function AmbassadorResources() {
  const [category, setCategory] = useQueryState("category", parseCategory);
  const [search, setSearch] = useQueryState("search", parseSearch);
  const resources = useQuery(api.resources.listPublished);

  if (resources === undefined) {
    return (
      <div className="space-y-5" aria-label="Loading resources">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className="h-40 animate-pulse rounded-xl bg-card"
            />
          ))}
        </div>
      </div>
    );
  }

  const filtered = resources.filter((r) => {
    const matchesCategory = r.category === category;
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5">
      <PageDescription page="ambassadorResources" className="max-w-2xl" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => void setCategory(cat)}
              className={`min-h-8 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                category === cat
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {categoryLabel[cat]}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search resources"
            placeholder="Search resources…"
            value={search}
            onChange={(e) => void setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search ? "No resources found" : "No resources yet"}
          description={
            search
              ? "Try a different search or category."
              : "Resources will appear here when admins publish them."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceCard({
  resource,
}: {
  resource: {
    _id: string;
    title: string;
    description: string;
    category: string;
    kind: string;
    url?: string;
    storageId?: Id<"_storage">;
  };
}) {
  const downloadUrl = useQuery(
    api.resources.getDownloadUrl,
    resource.kind === "file" && resource.storageId
      ? { storageId: resource.storageId }
      : "skip",
  );

  const Icon = categoryIcon[resource.category] ?? FileText;

  const href =
    resource.kind === "link"
      ? resource.url ?? "#"
      : downloadUrl ?? "#";

  return (
    <Card className="group flex flex-col gap-3 border-border p-5 transition-colors hover:border-primary/50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon aria-hidden="true" className="size-5 text-primary" />
        </div>
        <Badge variant="outline" className="shrink-0">
          {categoryLabel[resource.category] ?? resource.category}
        </Badge>
      </div>
      <div className="min-w-0 space-y-1">
        <h3 className="truncate text-sm font-semibold text-foreground">
          {resource.title}
        </h3>
        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
          {resource.description}
        </p>
      </div>
      <a
        href={href}
        target={resource.kind === "link" ? "_blank" : undefined}
        rel={resource.kind === "link" ? "noopener noreferrer" : undefined}
        className="mt-auto inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${resource.kind === "link" ? "Open" : "Download"} ${resource.title}`}
      >
        {resource.kind === "link" ? (
          <>
            <ExternalLink aria-hidden="true" className="size-4" />
            Open resource
          </>
        ) : (
          <>
            <Download aria-hidden="true" className="size-4" />
            Download file
          </>
        )}
      </a>
    </Card>
  );
}
