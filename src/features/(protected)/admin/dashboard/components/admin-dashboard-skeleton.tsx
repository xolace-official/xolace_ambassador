const statSkeletons = ["one", "two", "three", "four"];

export function AdminDashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-busy="true">
      <div className="h-12 w-full rounded-xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statSkeletons.map((skeleton) => (
          <div key={skeleton} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-80 rounded-xl bg-muted" />
        <div className="h-80 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
