"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Image,
  Layers,
  LinkIcon,
  Loader2,
  Upload,
  Video,
} from "lucide-react";
import { useRouter as useNextRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export const CATEGORIES = [
  "playbook",
  "videos",
  "brand_kit",
  "templates",
  "captions",
  "campaign_assets",
  "screenshots",
  "guide",
] as const;

export const KINDS = ["link", "file", "content", "video"] as const;

export const TRACKS = [
  "creator",
  "community",
  "growth",
  "creative",
  "production",
  "advocacy",
] as const;

export const categoryLabels: Record<(typeof CATEGORIES)[number], string> = {
  playbook: "Playbook / Write-up",
  videos: "Video Tutorial",
  brand_kit: "Brand Kit & Assets",
  templates: "Templates",
  captions: "Captions & Copy",
  campaign_assets: "Campaign Media",
  screenshots: "Screenshots & UI",
  guide: "Guide & Reading",
};

export const trackLabels: Record<(typeof TRACKS)[number], string> = {
  creator: "Creator",
  community: "Community",
  growth: "Growth",
  creative: "Creative",
  production: "Production",
  advocacy: "Advocacy",
};

const resourceFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(120),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters.")
    .max(500),
  category: z.enum(CATEGORIES),
  kind: z.enum(KINDS),
  url: z.string().trim().max(500).optional().or(z.literal("")),
  embedUrl: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().trim().optional().or(z.literal("")),
  track: z.enum(TRACKS).optional(),
  published: z.boolean(),
  sortOrder: z.number().int(),
  estimatedReadTime: z.string().trim().optional(),
  tags: z.string().trim().optional(),
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

interface AdminResourceFormProps {
  uuid: string;
  editingId?: string;
}

export function AdminResourceForm({ uuid, editingId }: AdminResourceFormProps) {
  const router = useNextRouter();
  const createResource = useAction(api.resources.adminCreate);
  const updateResource = useAction(api.resources.adminUpdate);
  const generateUploadUrl = useMutation(api.resources.generateUploadUrl);

  const existingResource = useQuery(
    api.resources.getById,
    editingId ? { resourceId: editingId } : "skip",
  );

  const [uploading, setUploading] = useState(false);
  const [uploadedStorageId, setUploadedStorageId] = useState<
    Id<"_storage"> | undefined
  >(undefined);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "playbook",
      kind: "content",
      url: "",
      embedUrl: "",
      content: "",
      published: true,
      sortOrder: 0,
      estimatedReadTime: "5 min read",
      tags: "",
    },
  });

  const selectedCategory = watch("category");
  const selectedKind = watch("kind");

  // Populate form if editing
  useEffect(() => {
    if (existingResource) {
      reset({
        title: existingResource.title,
        description: existingResource.description,
        category: existingResource.category as (typeof CATEGORIES)[number],
        kind: existingResource.kind as (typeof KINDS)[number],
        url: existingResource.url ?? "",
        embedUrl: existingResource.embedUrl ?? "",
        content: existingResource.content ?? "",
        track: existingResource.track as (typeof TRACKS)[number] | undefined,
        published: existingResource.published,
        sortOrder: existingResource.sortOrder,
        estimatedReadTime:
          existingResource.assetMetadata?.estimatedReadTime ?? "",
        tags: existingResource.assetMetadata?.tags?.join(", ") ?? "",
      });
      if (existingResource.storageId) {
        setUploadedStorageId(existingResource.storageId);
        setUploadedFileName("Uploaded file attached");
      }
    }
  }, [existingResource, reset]);

  // Adjust kind recommendation when category changes
  const handleCategoryChange = (cat: (typeof CATEGORIES)[number]) => {
    setValue("category", cat);
    if (cat === "playbook") {
      setValue("kind", "content");
    } else if (cat === "videos") {
      setValue("kind", "video");
    } else if (cat === "brand_kit" || cat === "screenshots") {
      setValue("kind", "file");
    } else if (cat === "guide") {
      setValue("kind", "link");
    }
  };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file to storage.");
      }

      const { storageId } = await result.json();
      setUploadedStorageId(storageId);
      setUploadedFileName(file.name);
      setValue("kind", "file");
      toast.success(`File "${file.name}" uploaded successfully.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "File upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: ResourceFormValues) {
    const parsedTags = values.tags
      ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    const payload = {
      title: values.title,
      description: values.description,
      category: values.category,
      kind: values.kind,
      url: values.url || undefined,
      embedUrl: values.embedUrl || undefined,
      content: values.content || undefined,
      storageId: uploadedStorageId,
      track: values.track || undefined,
      published: values.published,
      sortOrder: values.sortOrder,
      assetMetadata: {
        estimatedReadTime: values.estimatedReadTime || undefined,
        tags: parsedTags,
        fileType: uploadedFileName
          ? uploadedFileName.split(".").pop()
          : undefined,
      },
    };

    try {
      if (editingId) {
        await updateResource({ resourceId: editingId as never, ...payload });
        toast.success("Resource updated successfully.");
      } else {
        await createResource(payload as never);
        toast.success("Resource created successfully.");
      }
      router.push(`/admin/${uuid}/resources`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save resource.",
      );
    }
  }

  return (
    <Card className="rounded-none border-0 bg-transparent p-0 shadow-none sm:rounded-xl sm:border-border sm:bg-card sm:p-8 sm:shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          {/* Main Form Fields */}
          <div className="order-2 space-y-8 lg:order-1">
            <section aria-labelledby="resource-details-heading">
              <div className="mb-5">
                <h2
                  id="resource-details-heading"
                  className="text-lg font-semibold text-foreground"
                >
                  Resource Overview
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Provide a clear title, description, category, and target
                  audience for this resource.
                </p>
              </div>

              <FieldGroup>
                <Field data-invalid={!!errors.title}>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input
                    id="title"
                    autoComplete="off"
                    placeholder="e.g. Campus Event Launch Playbook 2026…"
                    aria-invalid={!!errors.title}
                    {...register("title")}
                  />
                  <FieldError errors={[errors.title]} />
                </Field>

                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor="description">
                    Summary / Description
                  </FieldLabel>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Brief explanation of what ambassadors will learn or gain from this resource…"
                    aria-invalid={!!errors.description}
                    {...register("description")}
                  />
                  <FieldError errors={[errors.description]} />
                </Field>
              </FieldGroup>
            </section>

            {/* Dynamic Content Section based on Kind */}
            <section
              aria-labelledby="resource-content-heading"
              className="border-t border-border pt-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2
                    id="resource-content-heading"
                    className="text-lg font-semibold text-foreground flex items-center gap-2"
                  >
                    {selectedKind === "content" && (
                      <FileText className="size-5 text-primary" />
                    )}
                    {selectedKind === "video" && (
                      <Video className="size-5 text-primary" />
                    )}
                    {selectedKind === "file" && (
                      <Upload className="size-5 text-primary" />
                    )}
                    {selectedKind === "link" && (
                      <LinkIcon className="size-5 text-primary" />
                    )}
                    Resource Content & Media
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Provide the write-up, video link, file upload, or external
                    URL based on resource type.
                  </p>
                </div>
              </div>

              <FieldGroup>
                {/* Written Content (Playbooks, Write-ups, Captions, Templates) */}
                {(selectedKind === "content" ||
                  selectedCategory === "playbook" ||
                  selectedCategory === "captions") && (
                  <Field data-invalid={!!errors.content}>
                    <FieldLabel htmlFor="content">
                      Written Content / Body
                    </FieldLabel>
                    <Textarea
                      id="content"
                      rows={10}
                      placeholder="Write your full playbook, guide steps, or caption templates here…"
                      aria-invalid={!!errors.content}
                      {...register("content")}
                    />
                    <FieldDescription>
                      Supports paragraphs and structured formatting. Ambassadors
                      can read directly on the detail page.
                    </FieldDescription>
                    <FieldError errors={[errors.content]} />
                  </Field>
                )}

                {/* Video URL & Embed */}
                {selectedKind === "video" && (
                  <Field data-invalid={!!errors.embedUrl}>
                    <FieldLabel htmlFor="embedUrl">
                      Video Embed / Stream URL
                    </FieldLabel>
                    <Input
                      id="embedUrl"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... or MP4 link"
                      aria-invalid={!!errors.embedUrl}
                      {...register("embedUrl")}
                    />
                    <FieldDescription>
                      YouTube, Vimeo, or direct MP4 links will render an
                      interactive player on the detail page.
                    </FieldDescription>
                    <FieldError errors={[errors.embedUrl]} />
                  </Field>
                )}

                {/* File Upload */}
                <Field>
                  <FieldLabel htmlFor="file-upload">
                    Upload File Attachment (Optional PDF / Video / Image)
                  </FieldLabel>
                  <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-4 text-center">
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                        <Loader2 className="size-5 animate-spin text-primary" />
                        <span>Uploading file to storage…</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="size-8 text-muted-foreground" />
                          <p className="text-sm font-medium text-foreground">
                            {uploadedFileName
                              ? uploadedFileName
                              : "Choose a PDF document, video, or brand asset"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded assets are served directly to ambassadors.
                          </p>
                        </div>
                        <label className="mx-auto cursor-pointer rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80">
                          <span>
                            {uploadedFileName ? "Replace File" : "Select File"}
                          </span>
                          <input
                            id="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileUpload}
                          />
                        </label>
                      </>
                    )}
                  </div>
                </Field>

                {/* External Link */}
                <Field data-invalid={!!errors.url}>
                  <FieldLabel htmlFor="url">
                    External / Reference URL (Optional)
                  </FieldLabel>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://drive.google.com/... or external website"
                    aria-invalid={!!errors.url}
                    {...register("url")}
                  />
                  <FieldDescription>
                    Provide an optional external URL for ambassadors to visit.
                  </FieldDescription>
                  <FieldError errors={[errors.url]} />
                </Field>

                {/* Additional Metadata: Estimated Read Time & Tags */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="estimatedReadTime">
                      Estimated Read / View Time
                    </FieldLabel>
                    <Input
                      id="estimatedReadTime"
                      placeholder="e.g. 5 min read / 10 min watch"
                      {...register("estimatedReadTime")}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="tags">
                      Tags (comma-separated)
                    </FieldLabel>
                    <Input
                      id="tags"
                      placeholder="e.g. outreach, instagram, event"
                      {...register("tags")}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </section>
          </div>

          {/* Sidebar Settings */}
          <aside className="order-1 space-y-6 lg:order-2">
            <section
              className="border-b border-border pb-6 lg:border-0 lg:pb-0"
              aria-labelledby="resource-setup-heading"
            >
              <div className="mb-5">
                <h2
                  id="resource-setup-heading"
                  className="text-lg font-semibold text-foreground"
                >
                  Resource Settings
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Configure category, format type, and publishing state.
                </p>
              </div>

              <FieldGroup>
                {/* Category */}
                <Field data-invalid={!!errors.category}>
                  <FieldLabel htmlFor="category">Category</FieldLabel>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val) =>
                          handleCategoryChange(
                            val as (typeof CATEGORIES)[number],
                          )
                        }
                      >
                        <SelectTrigger id="category" className="w-full">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {categoryLabels[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.category]} />
                </Field>

                {/* Format / Kind */}
                <Field data-invalid={!!errors.kind}>
                  <FieldLabel htmlFor="kind">Format Type</FieldLabel>
                  <Controller
                    control={control}
                    name="kind"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="kind" className="w-full capitalize">
                          <SelectValue placeholder="Select Format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="content">
                            Written Write-up / Playbook
                          </SelectItem>
                          <SelectItem value="video">
                            Video Stream / Media
                          </SelectItem>
                          <SelectItem value="file">
                            File Download / Asset
                          </SelectItem>
                          <SelectItem value="link">
                            External Web Link
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.kind]} />
                </Field>

                {/* Target Track */}
                <Field data-invalid={!!errors.track}>
                  <FieldLabel htmlFor="track">
                    Target Track (Optional)
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="track"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(v) =>
                          setValue(
                            "track",
                            (v || undefined) as
                              | (typeof TRACKS)[number]
                              | undefined,
                          )
                        }
                      >
                        <SelectTrigger id="track" className="w-full">
                          <SelectValue placeholder="All Program Tracks" />
                        </SelectTrigger>
                        <SelectContent>
                          {TRACKS.map((track) => (
                            <SelectItem key={track} value={track}>
                              {trackLabels[track]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.track]} />
                </Field>

                {/* Priority Sort Order */}
                <Field data-invalid={!!errors.sortOrder}>
                  <FieldLabel htmlFor="sortOrder">
                    Priority Sort Order
                  </FieldLabel>
                  <Input
                    id="sortOrder"
                    type="number"
                    {...register("sortOrder", { valueAsNumber: true })}
                  />
                  <FieldDescription>
                    Lower numbers appear first.
                  </FieldDescription>
                  <FieldError errors={[errors.sortOrder]} />
                </Field>

                {/* Published Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="published"
                    type="checkbox"
                    className="size-4 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register("published")}
                  />
                  <label
                    htmlFor="published"
                    className="text-sm font-medium text-foreground"
                  >
                    Publish immediately for ambassadors
                  </label>
                </div>
              </FieldGroup>
            </section>
          </aside>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/${uuid}/resources`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || uploading}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving resource…
              </>
            ) : editingId ? (
              "Save Resource Changes"
            ) : (
              "Create Resource"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
