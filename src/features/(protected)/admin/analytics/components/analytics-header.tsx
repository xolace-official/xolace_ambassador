import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalyticsHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-bold text-foreground">Analytics</h1>
      <Button size="sm" className="gap-2">
        <Plus aria-hidden="true" className="size-4" />
        Create Report
      </Button>
    </div>
  );
}
