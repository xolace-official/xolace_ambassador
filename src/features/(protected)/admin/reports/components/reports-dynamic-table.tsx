import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ReportsActionMenu } from "./reports-action-menu";

const numberFormat = new Intl.NumberFormat("en-GB");

export interface ColumnDef<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
}

export interface ReportsDynamicTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  rowId: (row: T) => string;
  page: number;
  onPageChange: (page: number) => void;
  onViewDetails: (row: T) => void;
  onExportRow: (row: T) => void;
  pageSize?: number;
}

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success",
  approved: "bg-success/10 text-success",
  published: "bg-primary/10 text-primary",
  pending: "bg-warning/10 text-warning",
  rejected: "bg-destructive/10 text-destructive",
  declined: "bg-destructive/10 text-destructive",
  paused: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive",
  draft: "bg-muted text-muted-foreground",
  closed: "bg-muted-foreground/20 text-muted-foreground",
  new: "bg-primary/10 text-primary",
  reviewing: "bg-warning/10 text-warning",
  accepted: "bg-success/10 text-success",
};

export function ReportsDynamicTable<T>({
  columns,
  rows,
  rowId,
  page,
  onPageChange,
  onViewDetails,
  onExportRow,
  pageSize = 8,
}: ReportsDynamicTableProps<T>) {
  const totalPages = Math.ceil(rows.length / pageSize);
  const currentPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const start = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return (
    <Card className="overflow-hidden border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground print:hidden">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No data found matching the selected filters.
                </td>
              </tr>
            ) : (
              pageRows.map((row, rowIndex) => (
                <tr
                  key={rowId(row)}
                  className={`hover:bg-muted/20 transition-colors ${
                    rowIndex === pageRows.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm text-foreground ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right print:hidden">
                    <ReportsActionMenu
                      actions={[
                        {
                          label: "View details",
                          onClick: () => onViewDetails(row),
                        },
                        {
                          label: "Export row",
                          onClick: () => onExportRow(row),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end px-4 py-2 print:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            type="button"
            className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={statusStyles[status] ?? "bg-muted text-muted-foreground"}>
      {status}
    </Badge>
  );
}

export function formatNumber(value: number | null): string {
  if (value === null) return "—";
  return numberFormat.format(value);
}
