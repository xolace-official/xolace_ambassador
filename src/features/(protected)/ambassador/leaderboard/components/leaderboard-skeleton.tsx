export function LeaderboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            aria-hidden="true"
            className="h-32 animate-pulse rounded-xl bg-card"
          />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            aria-hidden="true"
            className="h-12 animate-pulse rounded-xl bg-card"
          />
        ))}
      </div>
    </div>
  );
}
