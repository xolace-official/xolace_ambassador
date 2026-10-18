const statSkeletons = ["one", "two", "three", "four"];

export function AmbassadorDashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-busy="true">
      <div className="h-40 rounded-2xl bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statSkeletons.map((skeleton) => (
          <div key={skeleton} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-80 rounded-xl bg-muted" />
        <div className="h-80 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
