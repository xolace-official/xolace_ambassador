"use client";

import { usePaginatedQuery } from "convex/react";
import {
  BookOpen,
  Clock,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  PlayCircle,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { parseAsString } from "nuqs/server";
import { useEffect, useRef, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageDescription } from "@/components/shared/page-description";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

// Consolidate into 6 primary ambassador categories
const CATEGORIES = [
  "playbook",
  "videos",
  "brand_kit",
  "templates",
  "campaign_assets",
  "screenshots",
] as const;

const categoryLabel: Record<string, string> = {
  playbook: "Playbooks & Guides",
  videos: "Videos & Streams",
  brand_kit: "Brand & Media",
  templates: "Templates & Copy",
  campaign_assets: "Campaign Assets",
  screenshots: "Screenshots & UI",
  guide: "Playbooks & Guides",
  captions: "Templates & Copy",
};

const categoryIcon: Record<string, typeof FileText> = {
  playbook: BookOpen,
  videos: PlayCircle,
  brand_kit: ImageIcon,
  templates: FileText,
  campaign_assets: Sparkles,
  screenshots: ImageIcon,
  guide: BookOpen,
  captions: FileText,
};

// Maps legacy category values to consolidated primary category keys
function normalizeCategory(category: string): string {
  if (category === "guide") return "playbook";
  if (category === "captions") return "templates";
  return category;
}

export default function AmbassadorResources({ uuid }: { uuid?: string }) {
  // Default to selecting the first category pill ("playbook")
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withDefault(CATEGORIES[0]),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [searchInput, setSearchInput] = useState(search);
  const pendingSearch = useRef<string | null>(null);
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
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput, setSearch]);
  const {
    results: resources,
    status: resourceStatus,
    loadMore,
  } = usePaginatedQuery(
    api.resources.listPublished,
    { search: search.trim() || undefined },
    { initialNumItems: 12 },
  );

  if (resourceStatus === "LoadingFirstPage") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className="h-44 animate-pulse rounded-xl bg-card"
            />
          ))}
        </div>
      </div>
    );
  }

  const filtered = resources.filter((r) => {
    const normCategory = normalizeCategory(r.category);
    const matchesCategory = normCategory === category;
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageDescription page="ambassadorResources" className="max-w-2xl" />

      {/* Filter bar & Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={isActive}
                onClick={() => void setCategory(cat)}
                className={`h-8 rounded-full px-3 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {categoryLabel[cat]}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search resources"
            placeholder="Search playbooks, guides, assets…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            search ? "No matching resources" : "No resources in this category"
          }
          description={
            search
              ? "Try adjusting your search terms or category selection."
              : "Check back later for new playbooks, videos, and brand assets."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} uuid={uuid} />
          ))}
        </div>
      )}

      {resourceStatus === "CanLoadMore" || resourceStatus === "LoadingMore" ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadMore(12)}
            disabled={resourceStatus === "LoadingMore"}
          >
            {resourceStatus === "LoadingMore"
              ? "Loading…"
              : "Load more resources"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ResourceCard({
  resource,
  uuid,
}: {
  uuid?: string;
  resource: {
    _id: string;
    title: string;
    description: string;
    category: string;
    kind: string;
    url?: string;
    storageId?: Id<"_storage">;
    assetMetadata?: {
      estimatedReadTime?: string;
    };
  };
}) {
  const Icon = categoryIcon[resource.category] ?? FileText;
  const detailHref = uuid
    ? `/ambassador/${uuid}/resources/${resource._id}`
    : "#";

  return (
    <Card className="group flex flex-col justify-between border-border p-5 transition-all hover:border-primary/50 hover:shadow-md">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon aria-hidden="true" className="size-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {resource.assetMetadata?.estimatedReadTime ? (
              <Badge
                variant="outline"
                className="gap-1 text-[11px] text-muted-foreground"
              >
                <Clock className="size-3" />
                {resource.assetMetadata.estimatedReadTime}
              </Badge>
            ) : null}

            <Badge variant="outline" className="text-[11px]">
              {categoryLabel[resource.category] ?? resource.category}
            </Badge>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="line-clamp-1 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {resource.title}
          </h3>
          <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
            {resource.description}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-border/60 pt-3">
        <Button
          asChild
          className="w-full justify-between"
          variant="secondary"
          size="sm"
        >
          <Link href={detailHref}>
            <span>View Resource</span>
            <ExternalLink className="size-3.5 opacity-70" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
