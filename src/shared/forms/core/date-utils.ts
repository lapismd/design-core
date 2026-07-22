import {
  CalendarDate,
  getLocalTimeZone,
  type DateValue,
} from "@internationalized/date";
import { parseDate as parseChronoDate } from "chrono-node";

export type DueTone = "today" | "upcoming" | "overdue";

export type DueSummary = {
  shortDate: string;
  distance: string;
  tone: DueTone;
};

export type DateSuggestion = {
  id: string;
  label: string;
  date: string;
  dateLabel: string;
};

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Normalize a value to `YYYY-MM-DD`, or `undefined` when empty/invalid. */
export function normalizeDateOnly(value: string | undefined | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (DATE_ONLY_RE.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.valueOf())) return undefined;
  return formatDateOnly(parsed);
}

export function formatDateOnly(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayDateOnly() {
  return formatDateOnly(new Date());
}

function parseDateOnlyUtc(value: string) {
  if (!DATE_ONLY_RE.test(value)) return null;
  const [year, month, day] = value.split("-").map((part) => Number(part));
  return new Date(Date.UTC(year, month - 1, day));
}

export function getDayDistance(target: string, base: string) {
  const targetDate = parseDateOnlyUtc(target);
  const baseDate = parseDateOnlyUtc(base);
  if (!targetDate || !baseDate) return 0;
  return Math.round(
    (targetDate.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000),
  );
}

export function formatShortDate(dateOnly: string, locale?: string) {
  const parsed = parseDateOnlyUtc(dateOnly);
  if (!parsed) return dateOnly;
  const month = parsed.toLocaleDateString(locale, {
    timeZone: "UTC",
    month: "short",
  });
  return `${parsed.getUTCDate()} ${month}`;
}

export function getDueSummary(
  dueAt?: string | null,
  locale?: string,
): DueSummary | null {
  const dateOnly = normalizeDateOnly(dueAt);
  if (!dateOnly) return null;

  const today = todayDateOnly();
  const distance = getDayDistance(dateOnly, today);
  let tone: DueTone = "upcoming";
  let distanceLabel = "";

  if (distance === 0) {
    tone = "today";
    distanceLabel = "today";
  } else if (distance > 0) {
    distanceLabel = distance === 1 ? "1 day left" : `${distance} days left`;
  } else {
    tone = "overdue";
    const overdueDays = Math.abs(distance);
    distanceLabel = overdueDays === 1 ? "1 day ago" : `${overdueDays} days ago`;
  }

  return {
    shortDate: formatShortDate(dateOnly, locale),
    distance: distanceLabel,
    tone,
  };
}

export function calendarDateFromValue(
  value: string | null | undefined,
): DateValue | undefined {
  const dateOnly = normalizeDateOnly(value);
  if (!dateOnly) return undefined;
  const [year, month, day] = dateOnly.split("-").map((part) => Number(part));
  if (!year || !month || !day) return undefined;
  return new CalendarDate(year, month, day);
}

export function dateOnlyFromCalendarDate(date: DateValue) {
  const nativeDate = date.toDate(getLocalTimeZone());
  return formatDateOnly(nativeDate);
}

export function calendarDateFromDate(value: Date): DateValue {
  return new CalendarDate(
    value.getFullYear(),
    value.getMonth() + 1,
    value.getDate(),
  );
}

function formatSuggestionDate(value: Date, locale?: string) {
  return value.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    weekday: "short",
  });
}

function shiftDate(base: Date, amount: number, unit: "day" | "week" | "month") {
  const nextDate = new Date(base);
  if (unit === "day") {
    nextDate.setDate(nextDate.getDate() + amount);
  } else if (unit === "week") {
    nextDate.setDate(nextDate.getDate() + amount * 7);
  } else {
    nextDate.setMonth(nextDate.getMonth() + amount);
  }
  return nextDate;
}

/**
 * Build natural-language / numeric-offset date suggestions.
 * Numeric queries like `3` / `-2` offer day/week/month offsets; other phrases
 * are parsed with chrono-node.
 */
export function buildNaturalDateSuggestions(
  query: string,
  options?: { locale?: string; now?: Date },
): DateSuggestion[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const locale = options?.locale;
  const baseDate = options?.now ?? new Date();

  const numericMatch = /^([+-]?\d+)$/.exec(trimmed);
  if (numericMatch) {
    const rawAmount = Number(numericMatch[1]);
    if (Number.isFinite(rawAmount) && rawAmount !== 0) {
      const direction = rawAmount < 0 ? "earlier" : "later";
      const signedAmount = rawAmount;
      const absoluteAmount = Math.abs(rawAmount);
      return [
        {
          id: "days",
          label: `${absoluteAmount} day${absoluteAmount === 1 ? "" : "s"} ${direction}`,
          date: formatDateOnly(shiftDate(baseDate, signedAmount, "day")),
          dateLabel: formatSuggestionDate(
            shiftDate(baseDate, signedAmount, "day"),
            locale,
          ),
        },
        {
          id: "weeks",
          label: `${absoluteAmount} week${absoluteAmount === 1 ? "" : "s"} ${direction}`,
          date: formatDateOnly(shiftDate(baseDate, signedAmount, "week")),
          dateLabel: formatSuggestionDate(
            shiftDate(baseDate, signedAmount, "week"),
            locale,
          ),
        },
        {
          id: "months",
          label: `${absoluteAmount} month${absoluteAmount === 1 ? "" : "s"} ${direction}`,
          date: formatDateOnly(shiftDate(baseDate, signedAmount, "month")),
          dateLabel: formatSuggestionDate(
            shiftDate(baseDate, signedAmount, "month"),
            locale,
          ),
        },
      ];
    }
  }

  const parsed = parseChronoDate(trimmed, baseDate);
  if (!parsed) return [];

  return [
    {
      id: "parsed",
      label: trimmed,
      date: formatDateOnly(parsed),
      dateLabel: formatSuggestionDate(parsed, locale),
    },
  ];
}

/** Parse a natural-language query to `YYYY-MM-DD`, or `undefined`. */
export function parseNaturalDueDate(
  query: string,
  options?: { locale?: string; now?: Date },
) {
  const suggestions = buildNaturalDateSuggestions(query, options);
  return suggestions[0]?.date;
}
