type PointTimeline = { date: number; points: number };
type ContributionActivity = { _creationTime: number };

export function getWeeklyPointTotals(
  timeline: PointTimeline[],
  now = Date.now(),
) {
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  const currentStart = today.getTime() - 6 * 86_400_000;
  const previousStart = currentStart - 7 * 86_400_000;
  const sorted = timeline.slice().sort((a, b) => a.date - b.date);

  const pointsAt = (timestamp: number) =>
    sorted.filter((entry) => entry.date <= timestamp).at(-1)?.points ?? 0;
  const totalBetween = (start: number, end: number) =>
    Math.max(pointsAt(end) - pointsAt(start - 1), 0);

  let previous = pointsAt(currentStart - 1);
  const daily = Array.from({ length: 7 }, (_, index) => {
    const end = currentStart + (index + 1) * 86_400_000 - 1;
    const current = pointsAt(end);
    const earned = Math.max(current - previous, 0);
    previous = current;
    return earned;
  });

  return {
    daily,
    current: daily.reduce((sum, value) => sum + value, 0),
    previous: totalBetween(previousStart, currentStart - 1),
  };
}

export function getWeeklyContributionCounts(
  contributions: ContributionActivity[],
  now = Date.now(),
) {
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  const start = today.getTime() - 6 * 86_400_000;

  return Array.from({ length: 7 }, (_, index) => {
    const dayStart = start + index * 86_400_000;
    const dayEnd = dayStart + 86_400_000;
    return contributions.filter(
      (contribution) =>
        contribution._creationTime >= dayStart &&
        contribution._creationTime < dayEnd,
    ).length;
  });
}
