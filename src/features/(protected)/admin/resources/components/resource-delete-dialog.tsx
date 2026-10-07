import { useAction } from "convex/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "../../../../../../convex/_generated/api";

interface ResourceDeleteDialogProps {
  resourceId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function ResourceDeleteDialog({
  resourceId,
  onOpenChange,
}: ResourceDeleteDialogProps) {
  const deleteResource = useAction(api.resources.adminDelete);

  async function handleDelete() {
    if (!resourceId) return;
    try {
      await deleteResource({ resourceId: resourceId as never });
      toast.success("Resource deleted.");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete resource.",
      );
    }
  }

  return (
    <Dialog open={resourceId !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete resource?</DialogTitle>
          <DialogDescription>
            This will permanently remove the resource. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => void handleDelete()}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
