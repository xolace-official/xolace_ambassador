"use client";

import { useQuery } from "convex/react";
import {
  BookOpen,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Share2,
  Tag,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
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

export default function AmbassadorResourceDetail({
  resourceId,
}: {
  resourceId: string;
}) {
  const resource = useQuery(api.resources.getById, { resourceId });
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const downloadUrl = useQuery(
    api.resources.getDownloadUrl,
    resource?.storageId ? { storageId: resource.storageId } : "skip",
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

  if (resource === null || !resource.published) {
    return (
      <EmptyState
        icon={FileText}
        title="Resource not available"
        description="This resource may have been unpublished or removed by program admins."
      />
    );
  }

  function handleCopyContent(text: string) {
    void navigator.clipboard.writeText(text);
    setCopiedContent(true);
    toast.success("Content copied to clipboard!");
    setTimeout(() => setCopiedContent(false), 2000);
  }

  function handleShareLink() {
    void navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Resource link copied to clipboard!");
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
                <span>{copiedLink ? "Link Copied" : "Share"}</span>
              </Button>

              {downloadUrl ? (
                <Button asChild size="sm" className="gap-2">
                  <a
                    href={downloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="size-4" />
                    <span>Download Asset</span>
                  </a>
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

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Column (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Embedded Video Streaming Container */}
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
                  Video Overview & Highlights
                </h2>
                <p className="text-xs leading-6 text-muted-foreground">
                  Watch this video walkthrough for actionable guidance on
                  completing your missions.
                </p>
              </div>
            </Card>
          ) : null}

          {/* 2. Written Content / Playbook Reader */}
          {resource.content ? (
            <Card className="border-border p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" />
                  Playbook & Guide Content
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
                  <span>{copiedContent ? "Copied" : "Copy Content"}</span>
                </Button>
              </div>

              <div className="prose prose-sm max-w-none text-foreground leading-7 whitespace-pre-wrap font-sans">
                {resource.content}
              </div>
            </Card>
          ) : null}

          {/* 3. Download Asset Card */}
          {resource.storageId || resource.kind === "file" ? (
            <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-border p-6 bg-card">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Download className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Download File Asset
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Official file attachment available for download.
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
                <Button disabled variant="outline" size="sm">
                  Preparing asset…
                </Button>
              )}
            </Card>
          ) : null}

          {/* 4. External URL Launcher */}
          {resource.url ? (
            <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-border p-6 bg-card">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ExternalLink className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    External Resource Link
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
                  <span>Open External Link</span>
                </a>
              </Button>
            </Card>
          ) : null}
        </div>

        {/* Sidebar Column (1 Col) */}
        <div className="space-y-6">
          {/* Quick Specs Card */}
          <Card className="border-border p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Resource Details
            </h3>

            <div className="space-y-3 text-sm">
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

              {resource.assetMetadata?.estimatedReadTime ? (
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Read Time</span>
                  <span className="font-medium text-foreground">
                    {resource.assetMetadata.estimatedReadTime}
                  </span>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Share & Copy Quick Link */}
          <Card className="border-border p-6 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Share Resource
            </h3>
            <p className="text-xs leading-5 text-muted-foreground">
              Copy direct link to share with fellow ambassadors.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareLink}
              className="w-full justify-center gap-2"
            >
              {copiedLink ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="size-4" />
              )}
              <span>{copiedLink ? "Link Copied" : "Copy Resource Link"}</span>
            </Button>
          </Card>

          {/* Ambassador Guidance Support Box */}
          <Card className="border-border bg-secondary/30 p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <HelpCircle className="size-5" />
              <h3 className="text-sm font-semibold text-foreground">
                Need Help?
              </h3>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Have questions about applying this playbook or using brand assets?
              Reach out in your ambassador community channel.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
