import { MoreVertical } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ReportsActionMenuProps {
  actions: { label: string; onClick: () => void }[];
}

export function ReportsActionMenu({ actions }: ReportsActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="More actions"
        onClick={() => setOpen(!open)}
      >
        <MoreVertical aria-hidden="true" className="size-4" />
      </Button>
      {open ? (
        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-popover p-1 shadow-lg">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
              onClick={() => {
                action.onClick();
                setOpen(false);
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
