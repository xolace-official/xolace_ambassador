import { Construction } from "lucide-react";

export function FeatureComingSoon({
  title = "Coming soon",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3 text-center">
      <Construction className="size-10 text-muted-foreground" aria-hidden />

      <p className="text-lg font-semibold text-foreground">{title}</p>

      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
