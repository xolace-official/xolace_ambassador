import { useAction } from "convex/react";
import { Eye, EyeOff, Globe, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "../../../../../../convex/_generated/api";

interface ResourceListItemProps {
  uuid: string;
  resource: {
    _id: string;
    title: string;
    description: string;
    category: string;
    kind: string;
    track?: string;
    published: boolean;
  };
  onDelete: () => void;
}

export function ResourceListItem({
  uuid,
  resource,
  onDelete,
}: ResourceListItemProps) {
  const togglePublished = useAction(api.resources.adminTogglePublished);

  async function handleToggle() {
    try {
      await togglePublished({ resourceId: resource._id as never });
      toast.success(
        resource.published ? "Resource unpublished." : "Resource published.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update resource.",
      );
    }
  }

  return (
    <li className="flex items-center gap-4 px-5 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {resource.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {resource.description}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={resource.published ? "Unpublish" : "Publish"}
          onClick={() => void handleToggle()}
        >
          {resource.published ? (
            <Globe aria-hidden="true" className="size-4 text-success" />
          ) : (
            <EyeOff
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          )}
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link
            href={`/admin/${uuid}/resources/${resource._id}`}
            aria-label="View resource"
          >
            <Eye aria-hidden="true" className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link
            href={`/admin/${uuid}/resources/${resource._id}/edit`}
            aria-label="Edit resource"
          >
            <Pencil aria-hidden="true" className="size-4" />
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Delete"
          onClick={onDelete}
        >
          <Trash2 aria-hidden="true" className="size-4 text-destructive" />
        </Button>
      </div>
    </li>
  );
}
