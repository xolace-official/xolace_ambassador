interface MissionStatsProps {
  available: number;
  active: number;
  underReview: number;
  completed: number;
}

export function MissionStats({
  available,
  active,
  underReview,
  completed,
}: MissionStatsProps) {
  const stats = [
    { label: "Available", value: available },
    { label: "Active", value: active },
    { label: "Under review", value: underReview },
    { label: "Completed", value: completed },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-border bg-card p-4 sm:p-5"
        >
          <p className="text-sm text-muted-foreground">{stat.label}</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-card-foreground">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
