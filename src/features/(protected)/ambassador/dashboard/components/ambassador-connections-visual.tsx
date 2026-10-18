import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

// Generates a deterministic bubble layout for the hex-like network visual
function buildBubbles(total: number) {
  const rings = [1, 6, 12, 18, 24];
  const cells: { cx: number; cy: number; r: number; opacity: number }[] = [];
  const cx0 = 100;
  const cy0 = 100;
  const spacing = 18;
  let placed = 0;

  cells.push({ cx: cx0, cy: cy0, r: 9, opacity: 0.9 });
  placed++;

  for (let ring = 1; ring < rings.length && placed < total + 1; ring++) {
    const count = rings[ring];
    for (let i = 0; i < count && placed < total + 1; i++) {
      const angle = (2 * Math.PI * i) / count;
      const dist = ring * spacing;
      cells.push({
        cx: cx0 + dist * Math.cos(angle),
        cy: cy0 + dist * Math.sin(angle),
        r: 8 - ring * 0.8,
        opacity: Math.max(0.15, 0.9 - ring * 0.15),
      });
      placed++;
    }
  }
  return cells;
}

export function AmbassadorConnectionsVisual({
  peopleReached,
  uuid,
}: {
  peopleReached: number;
  uuid: string;
}) {
  // Clamp displayed bubbles between 1 and 61 (4 rings)
  const displayCount = Math.max(
    1,
    Math.min(
      61,
      peopleReached > 0
        ? 10 + Math.floor(Math.log10(peopleReached + 1) * 12)
        : 1,
    ),
  );
  const bubbles = buildBubbles(displayCount);

  return (
    <Card className="overflow-hidden rounded-2xl border-border/60 py-0 shadow-none">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Connections
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              People you&apos;ve reached through your impact.
            </p>
          </div>
          <Link
            href={`/ambassador/${uuid}/impact`}
            aria-label="View impact details"
            className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="relative mt-3 flex items-center justify-center overflow-hidden rounded-xl bg-muted/20 py-3">
          <svg
            viewBox="0 0 200 200"
            width="100%"
            height="180"
            aria-label={`Network of ${peopleReached} people reached`}
            role="img"
          >
            {bubbles.map((b) => (
              <circle
                key={`${b.cx}-${b.cy}`}
                cx={b.cx}
                cy={b.cy}
                r={b.r}
                fill="var(--primary)"
                fillOpacity={b.opacity}
              />
            ))}
          </svg>
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-xs font-medium text-muted-foreground">
              {peopleReached.toLocaleString("en-GB")} people reached
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-primary" />
            Active
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-primary/30" />
            Reached
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
