export function AnalyticsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-card" />
      <div className="h-64 animate-pulse rounded-xl bg-card" />
      <div className="grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            aria-hidden="true"
            className="h-48 animate-pulse rounded-xl bg-card"
          />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="h-48 animate-pulse rounded-xl bg-card"
      />
    </div>
  );
}
