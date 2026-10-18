export function SettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-busy="true">
      <div className="h-5 w-80 rounded-lg bg-muted" />
      <div className="h-72 rounded-xl bg-muted" />
    </div>
  );
}
