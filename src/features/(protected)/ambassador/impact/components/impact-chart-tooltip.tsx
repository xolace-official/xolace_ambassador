export function ImpactChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      {label ? (
        <p className="mb-1 font-medium text-foreground">{label}</p>
      ) : null}
      {payload.map((entry) => (
        <p
          key={entry.name}
          style={{ color: entry.color }}
          className="text-muted-foreground"
        >
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}
