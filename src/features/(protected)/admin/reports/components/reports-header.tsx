import { BarChart3, Star } from "lucide-react";

export function ReportsHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
        <BarChart3 aria-hidden="true" className="size-5 text-primary" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-foreground">Reports</h1>
          <Star
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Auto-updates in 2 min
        </p>
      </div>
    </div>
  );
}
