import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Pass `col-span-full` when rendering inside a grid. */
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "items-center gap-3 border-border/70 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? <Icon aria-hidden className="size-7 text-foreground/35" /> : null}

      <p className="text-base font-medium text-balance text-foreground">
        {title}
      </p>

      <p className="max-w-sm text-pretty text-sm leading-6 text-foreground/60">
        {description}
      </p>

      {action ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-1"
        >
          {action.label}
        </Button>
      ) : null}
    </Card>
  );
}
