export type TimeValue = Date | string | number;
export function timeMilliseconds(value: TimeValue): number {
  return value instanceof Date
    ? value.getTime()
    : typeof value === "number"
      ? value
      : Date.parse(value);
}
export function formatRelativeTime(
  value: TimeValue,
  options: { now?: number; locale?: string; absoluteAfterDays?: number } = {},
): { text: string; full: string; datetime?: string } {
  const time = timeMilliseconds(value),
    now = options.now ?? Date.now();
  if (
    !Number.isFinite(time) ||
    !Number.isFinite(now) ||
    Math.abs(time) > 8.64e15
  )
    return { text: "Unknown date", full: "Unknown date" };
  const date = new Date(time),
    seconds = (time - now) / 1000;
  const full = new Intl.DateTimeFormat(options.locale, {
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);
  let text: string;
  if (Math.abs(seconds) >= (options.absoluteAfterDays ?? 30) * 86400)
    text = new Intl.DateTimeFormat(options.locale, {
      dateStyle: "medium",
    }).format(date);
  else {
    const [unit, divisor] =
      Math.abs(seconds) < 60
        ? (["second", 1] as const)
        : Math.abs(seconds) < 3600
          ? (["minute", 60] as const)
          : Math.abs(seconds) < 86400
            ? (["hour", 3600] as const)
            : (["day", 86400] as const);
    const count = Math.round(seconds / divisor);
    text = new Intl.RelativeTimeFormat(options.locale, {
      numeric: "auto",
    }).format(Object.is(count, -0) ? 0 : count, unit);
  }
  return { text, full, datetime: date.toISOString() };
}
