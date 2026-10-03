import type { UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 border-b border-border pb-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold text-foreground">{title}</h2>
            <p className="mt-1 hidden text-sm leading-6 text-muted-foreground sm:block">
              {description}
            </p>
          </div>
        </div>
        <div className="pt-5">{children}</div>
      </CardContent>
    </Card>
  );
}
