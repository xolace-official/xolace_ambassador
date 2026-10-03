export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-busy="true">
      <div className="h-5 w-80 rounded-lg bg-muted" />
      <div className="h-96 rounded-2xl bg-muted" />
    </div>
  );
}
