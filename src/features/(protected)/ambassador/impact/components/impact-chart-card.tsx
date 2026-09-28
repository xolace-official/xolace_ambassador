import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

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
    <Card className="border-border p-5">
      <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>
      {isEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="h-64" role="img" aria-label={`${title} chart`}>
          {children}
        </div>
      )}
    </Card>
  );
}
