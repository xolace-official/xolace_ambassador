import {
  FileSpreadsheet,
  FileText,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterOption {
  value: string;
  label: string;
}

interface ReportsFilterBarProps {
  reportType: string;
  onReportTypeChange: (value: string) => void;
  reportTypeOptions: FilterOption[];
  search: string;
  onSearchChange: (value: string) => void;
  period: string;
  onPeriodChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
}

export function ReportsFilterBar({
  reportType,
  onReportTypeChange,
  reportTypeOptions,
  search,
  onSearchChange,
  period,
  onPeriodChange,
  status,
  onStatusChange,
  onExportPdf,
  onExportExcel,
}: ReportsFilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between print:hidden">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={reportType} onValueChange={onReportTypeChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {reportTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Toggle status filter"
          aria-pressed={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
        </Button>
        {filtersOpen ? (
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-32" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1 sm:w-64">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search reports"
            placeholder="Search…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onExportPdf}
        >
          <FileText aria-hidden="true" className="size-4 text-destructive" />
          <span>Export PDF</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onExportExcel}
        >
          <FileSpreadsheet aria-hidden="true" className="size-4 text-success" />
          <span>Export Excel</span>
        </Button>
      </div>
    </div>
  );
}
