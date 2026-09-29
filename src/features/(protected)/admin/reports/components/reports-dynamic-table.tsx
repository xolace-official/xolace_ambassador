import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ReportsActionMenu } from "./reports-action-menu";

const numberFormat = new Intl.NumberFormat("en-GB");

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ColumnDef {
  key: string;
  label: string;
  render: (row: any) => React.ReactNode;
  align?: "left" | "right";
}

interface ReportsDynamicTableProps {
  columns: ColumnDef[];
  rows: any[];
  rowId: (row: any) => string;
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
};

export function ReportsDynamicTable({
  columns,
  rows,
  rowId,
  pageSize = 8,
}: ReportsDynamicTableProps) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(rows.length / pageSize);
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  const allSelected =
    pageRows.length > 0 && pageRows.every((r) => selected.has(rowId(r)));

  function toggleAll() {
    const next = new Set(selected);
    if (allSelected) {
      for (const r of pageRows) next.delete(rowId(r));
    } else {
      for (const r of pageRows) next.add(rowId(r));
    }
    setSelected(next);
  }

  function toggleRow(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  }

  return (
    <Card className="overflow-hidden border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="size-4 rounded border-input accent-primary"
                />
              </th>
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
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows.map((row, rowIndex) => (
              <tr
                key={rowId(row)}
                className={`hover:bg-muted/20 transition-colors ${rowIndex === pageRows.length - 1 ? "border-b border-border" : ""}`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select row"
                    checked={selected.has(rowId(row))}
                    onChange={() => toggleRow(rowId(row))}
                    className="size-4 rounded border-input accent-primary"
                  />
                </td>
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
                <td className="px-4 py-3 text-right">
                  <ReportsActionMenu
                    actions={[
                      { label: "View details", onClick: () => {} },
                      { label: "Export row", onClick: () => {} },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
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
    <Badge
      className={statusStyles[status] ?? "bg-muted text-muted-foreground"}
    >
      {status}
    </Badge>
  );
}

export function formatNumber(value: number | null): string {
  if (value === null) return "—";
  return numberFormat.format(value);
}
