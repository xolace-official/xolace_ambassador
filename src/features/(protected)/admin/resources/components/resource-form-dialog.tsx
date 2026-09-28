import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CATEGORIES = [
  "brand_kit",
  "templates",
  "videos",
  "campaign_assets",
  "captions",
  "screenshots",
  "guide",
] as const;

export const TRACKS = [
  "creator",
  "community",
  "growth",
  "creative",
  "production",
  "advocacy",
] as const;

export const categoryLabel: Record<string, string> = {
  brand_kit: "Brand Kit",
  templates: "Templates",
  videos: "Videos",
  campaign_assets: "Campaign Assets",
  captions: "Captions",
  screenshots: "Screenshots",
  guide: "Guides",
};

export const trackLabel: Record<string, string> = {
  creator: "Creator",
  community: "Community",
  growth: "Growth",
  creative: "Creative",
  production: "Production",
  advocacy: "Advocacy",
};

const resourceSchema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(120),
  description: z.string().trim().min(10, "Enter a description.").max(500),
  category: z.enum(CATEGORIES),
  kind: z.enum(["link", "file"]),
  url: z.string().max(500).optional().or(z.literal("")),
  track: z.enum(TRACKS).optional(),
  published: z.boolean(),
  sortOrder: z.number(),
});

export type ResourceForm = z.infer<typeof resourceSchema>;

const emptyForm: ResourceForm = {
  title: "",
  description: "",
  category: "brand_kit",
  kind: "link",
  url: "",
  track: undefined,
  published: false,
  sortOrder: 0,
};

interface ResourceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  onSaved: () => void;
  defaultValues?: ResourceForm;
}

export function ResourceFormDialog({
  open,
  onOpenChange,
  editingId,
  onSaved,
  defaultValues,
}: ResourceFormDialogProps) {
  const createResource = useAction(api.resources.adminCreate);
  const updateResource = useAction(api.resources.adminUpdate);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResourceForm>({
    resolver: zodResolver(resourceSchema),
    defaultValues: defaultValues ?? emptyForm,
  });

  const kind = watch("kind");

  useEffect(() => {
    if (open) {
      reset(defaultValues ?? emptyForm);
    }
  }, [open, defaultValues, reset]);

  async function onSubmit(values: ResourceForm) {
    const payload = {
      title: values.title,
      description: values.description,
      category: values.category,
      kind: values.kind,
      url: values.url || undefined,
      track: values.track,
      published: values.published,
      sortOrder: values.sortOrder,
    };

    try {
      if (editingId) {
        await updateResource({ resourceId: editingId as never, ...payload });
        toast.success("Resource updated.");
      } else {
        await createResource(payload as never);
        toast.success("Resource created.");
      }
      reset(emptyForm);
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save resource.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Edit resource" : "Create resource"}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? "Update the resource details below."
              : "Add a new resource for ambassadors to access."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="res-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="res-title"
              {...register("title")}
              placeholder="Resource title…"
            />
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="res-desc" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="res-desc"
              {...register("description")}
              rows={3}
              placeholder="What is this resource for…"
            />
            {errors.description ? (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="res-category" className="text-sm font-medium">
                Category
              </label>
              <Select
                value={watch("category")}
                onValueChange={(v) =>
                  setValue("category", v as (typeof CATEGORIES)[number])
                }
              >
                <SelectTrigger id="res-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabel[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 w-full">
              <label htmlFor="res-kind" className="text-sm font-medium">
                Type
              </label>
              <Select
                value={kind}
                onValueChange={(v) => setValue("kind", v as "link" | "file")}
              >
                <SelectTrigger id="res-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {kind === "link" ? (
              <div className="space-y-2">
                <label htmlFor="res-url" className="text-sm font-medium">
                  URL
                </label>
                <Input
                  id="res-url"
                  {...register("url")}
                  placeholder="https://…"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">File upload</label>
                <p className="text-xs text-muted-foreground">
                  File storage integration coming soon. Use a link for now.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="res-track" className="text-sm font-medium">
                Track (optional)
              </label>
              <Select
                value={watch("track") ?? ""}
                onValueChange={(v) =>
                  setValue(
                    "track",
                    (v || undefined) as (typeof TRACKS)[number] | undefined,
                  )
                }
              >
                <SelectTrigger id="res-track" className="w-full">
                  <SelectValue placeholder="All tracks" />
                </SelectTrigger>
                <SelectContent>
                  {TRACKS.map((track) => (
                    <SelectItem key={track} value={track}>
                      {trackLabel[track]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="res-published"
              type="checkbox"
              {...register("published")}
              className="size-4 rounded border-input accent-primary"
            />
            <label htmlFor="res-published" className="text-sm font-medium">
              Published
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
