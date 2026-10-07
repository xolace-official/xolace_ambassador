import type { ReactNode } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";

interface ImpactChartCardProps {
  title: string;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  children: ReactNode;
}

export function ImpactChartCard({
  title,
  isEmpty,
  emptyTitle,
  emptyDescription,
  children,
}: ImpactChartCardProps) {
  return (
    <Card className="border-border p-5 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-foreground">{title}</h2>
      {isEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div
          className="h-72 min-w-0 sm:h-80"
          role="img"
          aria-label={`${title} chart`}
        >
          {children}
        </div>
      )}
    </Card>
  );
}
