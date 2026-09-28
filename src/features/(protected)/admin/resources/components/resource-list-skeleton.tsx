export function ResourceListSkeleton() {
  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          aria-hidden="true"
          className="flex items-center gap-4 px-5 py-4"
        >
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="h-3 w-72 max-w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
