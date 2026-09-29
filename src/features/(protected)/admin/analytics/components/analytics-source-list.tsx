import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const numberFormat = new Intl.NumberFormat("en-GB");

interface SourceItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface AnalyticsSourceListProps {
  title: string;
  data: SourceItem[];
}

export function AnalyticsSourceList({ title, data }: AnalyticsSourceListProps) {
  return (
    <Card className="border-border p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Select defaultValue="monthly">
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Last Week</SelectItem>
            <SelectItem value="monthly">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ul className="space-y-2.5">
        {data.map((item) => (
          <li key={item.name} className="flex items-center gap-3">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ background: item.color }}
            />
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">
              {item.name}
            </span>
            <span className="text-sm font-medium tabular-nums text-foreground">
              {numberFormat.format(item.value)}
            </span>
            <span className="w-12 text-right text-xs text-muted-foreground">
              {item.percentage.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
