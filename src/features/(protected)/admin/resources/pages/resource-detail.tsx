"use client";

import { useQuery } from "convex/react";
import {
  BookOpen,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Pencil,
  Share2,
  Tag,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "../../../../../../convex/_generated/api";

const categoryLabels: Record<string, string> = {
  playbook: "Playbooks & Guides",
  videos: "Videos & Streams",
  brand_kit: "Brand & Media",
  templates: "Templates & Copy",
  campaign_assets: "Campaign Assets",
  screenshots: "Screenshots & UI",
  guide: "Playbooks & Guides",
  captions: "Templates & Copy",
};

const trackLabels: Record<string, string> = {
  creator: "Creator Track",
  community: "Community Track",
  growth: "Growth Track",
  creative: "Creative Track",
  production: "Production Track",
  advocacy: "Advocacy Track",
};

export default function AdminResourceDetail({
  resourceId,
  uuid,
}: {
  resourceId: string;
  uuid?: string;
}) {
  const resource = useQuery(api.resources.getById, { resourceId });
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const downloadUrl = useQuery(
    api.resources.getDownloadUrl,
    resource?.storageId ? { resourceId } : "skip",
  );

  if (resource === undefined) {
    return (
      <div className="space-y-6">
        <div className="h-48 animate-pulse rounded-2xl bg-card" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-2xl bg-card lg:col-span-2" />
          <div className="h-96 animate-pulse rounded-2xl bg-card" />
        </div>
      </div>
    );
  }

  if (resource === null) {
    return (
      <EmptyState
        icon={FileText}
        title="Resource not found"
        description="This resource may have been deleted or the link is invalid."
      />
    );
  }

  function handleCopyContent(text: string) {
    void navigator.clipboard.writeText(text);
    setCopiedContent(true);
    toast.success("Content copied!");
    setTimeout(() => setCopiedContent(false), 2000);
  }

  function handleShareLink() {
    void navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Admin resource link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function getEmbedUrl(url?: string): string | undefined {
    if (!url) return undefined;
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "www.youtube.com/embed/");
    }
    return url;
  }

  const embedVideoUrl = getEmbedUrl(resource.embedUrl || resource.url);

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <Card className="relative overflow-hidden border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareLink}
                className="gap-2"
              >
                {copiedLink ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Share2 className="size-4" />
                )}
                <span>{copiedLink ? "Copied" : "Share"}</span>
              </Button>

              {uuid ? (
                <Button asChild size="sm" className="gap-2">
                  <Link href={`/admin/${uuid}/resources/${resource._id}/edit`}>
                    <Pencil className="size-4" />
                    <span>Edit Resource</span>
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {resource.title}
          </h1>

          <p className="text-base leading-7 text-muted-foreground max-w-3xl">
            {resource.description}
          </p>

          {resource.assetMetadata?.tags &&
          resource.assetMetadata.tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Tag
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              {resource.assetMetadata.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-md bg-secondary/80 px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Card>

      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Video Player */}
          {(resource.category === "videos" || resource.kind === "video") &&
          embedVideoUrl ? (
            <Card className="overflow-hidden border-border p-0 shadow-sm">
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={embedVideoUrl}
                  title={resource.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="size-full border-0"
                />
              </div>
              <div className="p-6 space-y-2">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Video className="size-4 text-primary" />
                  Video Embed Preview
                </h2>
                <p className="text-xs text-muted-foreground">
                  Streaming URL: {resource.embedUrl || resource.url}
                </p>
              </div>
            </Card>
          ) : null}

          {/* Written Playbook Content */}
          {resource.content ? (
            <Card className="border-border p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" />
                  Playbook Body Text
                </h2>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyContent(resource.content ?? "")}
                  className="gap-2"
                >
                  {copiedContent ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  <span>{copiedContent ? "Copied" : "Copy Body"}</span>
                </Button>
              </div>

              <div className="prose prose-sm max-w-none text-foreground leading-7 whitespace-pre-wrap font-sans">
                {resource.content}
              </div>
            </Card>
          ) : null}

          {/* Storage Attachment */}
          {resource.storageId || resource.kind === "file" ? (
            <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-border p-6 bg-card">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Download className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Attached Asset File
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Storage ID: {resource.storageId ?? "None"}
                  </p>
                </div>
              </div>

              {downloadUrl ? (
                <Button asChild size="sm">
                  <a
                    href={downloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download aria-hidden="true" className="size-4" />
                    <span>Download File</span>
                  </a>
                </Button>
              ) : (
                <Button disabled variant="outline" size={"sm"}>
                  No active download URL
                </Button>
              )}
            </Card>
          ) : null}

          {/* External Link */}
          {resource.url ? (
            <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-border p-6 bg-card">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ExternalLink className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    External URL
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">
                    {resource.url}
                  </p>
                </div>
              </div>

              <Button asChild size="sm">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink aria-hidden="true" className="size-4" />
                  <span>Open URL</span>
                </a>
              </Button>
            </Card>
          ) : null}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Admin Metadata Card */}
          <Card className="border-border p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Admin Specifications
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  className={
                    resource.published
                      ? "bg-success text-success-foreground"
                      : "bg-muted"
                  }
                >
                  {resource.published ? "Published" : "Draft"}
                </Badge>
              </div>

              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium text-foreground">
                  {categoryLabels[resource.category] ?? resource.category}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium text-foreground capitalize">
                  {resource.kind}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Target Track</span>
                <span className="font-medium text-foreground">
                  {resource.track
                    ? (trackLabels[resource.track] ?? resource.track)
                    : "All Tracks"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Sort Order</span>
                <span className="font-medium text-foreground">
                  {resource.sortOrder}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Edit CTA Card */}
          {uuid ? (
            <Card className="border-border p-6 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Manage Resource
              </h3>
              <p className="text-xs leading-5 text-muted-foreground">
                Update content, replace attached files, or change publish
                status.
              </p>
              <Button asChild className="w-full justify-center gap-2">
                <Link href={`/admin/${uuid}/resources/${resource._id}/edit`}>
                  <Pencil className="size-4" />
                  <span>Edit Resource Details</span>
                </Link>
              </Button>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
