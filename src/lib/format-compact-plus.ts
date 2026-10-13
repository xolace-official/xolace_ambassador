export function formatCompactPlus(value: number): string {
  if (value <= 0) return "0";

  if (value < 1_000) {
    const rounded = Math.floor(value / 10) * 10;
    return `${Math.max(rounded, 1)}+`;
  }

  const units = [
    { divisor: 1_000_000_000, suffix: "b" },
    { divisor: 1_000_000, suffix: "m" },
    { divisor: 1_000, suffix: "k" },
  ];
  const unit = units.find(({ divisor }) => value >= divisor);
  if (!unit) return `${value}+`;

  const compact = Math.floor((value / unit.divisor) * 10) / 10;
  return `${compact.toFixed(compact % 1 === 0 ? 0 : 1)}${unit.suffix}+`;
}
