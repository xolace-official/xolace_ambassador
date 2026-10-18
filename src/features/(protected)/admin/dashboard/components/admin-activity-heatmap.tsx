// heatmap grid derived from timeline's daily contribution counts
interface HeatCell {
  date: string;
  contributions: number;
}

const LEVELS = 5;

function getLevel(value: number, max: number) {
  if (max === 0 || value === 0) return 0;
  return Math.min(Math.ceil((value / max) * (LEVELS - 1)), LEVELS - 1);
}

export function AdminActivityHeatmap({ data }: { data: HeatCell[] }) {
  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Heatmap will populate as ambassadors contribute.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.contributions), 1);
  // Take the last 35 days (5 rows × 7 cols)
  const cells = data.slice(-35);

  const cols = 7;
  const rows = Math.ceil(cells.length / cols);

  // Pad to fill the grid. Keys are assigned here rather than taken from the map
  // index so the leading blanks keep a stable identity as the data grows.
  const slots: { key: string; cell: HeatCell | null }[] = [
    ...Array.from({ length: rows * cols - cells.length }, (_, i) => ({
      key: `pad-${i}`,
      cell: null,
    })),
    ...cells.map((cell) => ({ key: cell.date, cell })),
  ];

  return (
    <div role="img" aria-label="Activity heatmap">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {slots.map(({ key, cell }) => {
          if (!cell) {
            return (
              <div key={key} className="aspect-square rounded-sm bg-muted/30" />
            );
          }
          const level = getLevel(cell.contributions, max);
          const opacityMap = [
            "bg-primary/10",
            "bg-primary/25",
            "bg-primary/45",
            "bg-primary/70",
            "bg-primary",
          ];
          return (
            <div
              key={key}
              className={`aspect-square rounded-sm ${opacityMap[level]}`}
              title={`${cell.date}: ${cell.contributions} contributions`}
            />
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => {
          const opacityMap = [
            "bg-primary/10",
            "bg-primary/25",
            "bg-primary/45",
            "bg-primary/70",
            "bg-primary",
          ];
          return (
            <div key={l} className={`size-2.5 rounded-sm ${opacityMap[l]}`} />
          );
        })}
        <span>More</span>
      </div>
    </div>
  );
}
