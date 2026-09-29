import { FileSpreadsheet, FileText, Search, SlidersHorizontal } from "lucide-react";
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
}

export function ReportsFilterBar({
  reportType,
  onReportTypeChange,
  reportTypeOptions,
  search,
  onSearchChange,
}: ReportsFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2">
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

        <Select defaultValue="monthly">
          <SelectTrigger className="w-full sm:w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" aria-label="Filter">
          <SlidersHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 lg:flex-none">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search reports"
            placeholder="Search…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 lg:w-72"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText aria-hidden="true" className="size-4 text-destructive" />
          <span className="hidden sm:inline">Export PDF</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <FileSpreadsheet aria-hidden="true" className="size-4 text-success" />
          <span className="hidden sm:inline">Export Excel</span>
        </Button>
      </div>
    </div>
  );
}
