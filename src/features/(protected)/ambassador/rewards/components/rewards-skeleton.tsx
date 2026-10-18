export function RewardsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            aria-hidden="true"
            className="h-24 animate-pulse rounded-xl bg-card"
          />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="h-40 animate-pulse rounded-xl bg-card"
      />
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
