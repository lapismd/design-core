export function formatDiffDelta(value: number, prefix: "+" | "-"): string {
  return `${prefix}${value > 0 ? value : 0}`;
}
