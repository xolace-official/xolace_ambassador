export function ReportsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            aria-hidden="true"
            className="h-24 animate-pulse rounded-xl bg-card"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div
          aria-hidden="true"
          className="h-64 animate-pulse rounded-xl bg-card"
        />
        <div
          aria-hidden="true"
          className="h-64 animate-pulse rounded-xl bg-card"
        />
      </div>
    </div>
  );
}
