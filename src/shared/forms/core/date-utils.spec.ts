import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildNaturalDateSuggestions,
  formatDateOnly,
  normalizeDateOnly,
  parseNaturalDueDate,
  todayDateOnly,
} from "./date-utils";

describe("normalizeDateOnly", () => {
  it("returns undefined for empty values", () => {
    expect(normalizeDateOnly(undefined)).toBeUndefined();
    expect(normalizeDateOnly(null)).toBeUndefined();
    expect(normalizeDateOnly("")).toBeUndefined();
    expect(normalizeDateOnly("   ")).toBeUndefined();
  });

  it("passes through YYYY-MM-DD", () => {
    expect(normalizeDateOnly("2026-07-22")).toBe("2026-07-22");
  });

  it("rejects invalid strings", () => {
    expect(normalizeDateOnly("not-a-date")).toBeUndefined();
  });
});

describe("buildNaturalDateSuggestions", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("parses today and tomorrow relative to a fixed now", () => {
    const now = new Date(2026, 6, 22, 12, 0, 0);
    vi.setSystemTime(now);

    const today = buildNaturalDateSuggestions("today", { now });
    expect(today).toHaveLength(1);
    expect(today[0]?.date).toBe("2026-07-22");
    expect(today[0]?.label).toBe("today");

    const tomorrow = buildNaturalDateSuggestions("tomorrow", { now });
    expect(tomorrow).toHaveLength(1);
    expect(tomorrow[0]?.date).toBe("2026-07-23");
    expect(parseNaturalDueDate("tomorrow", { now })).toBe("2026-07-23");
  });

  it("offers day/week/month offsets for numeric queries", () => {
    const now = new Date(2026, 6, 22, 12, 0, 0);

    const later = buildNaturalDateSuggestions("3", { now });
    expect(later.map((item) => item.id)).toEqual(["days", "weeks", "months"]);
    expect(later[0]).toMatchObject({
      date: "2026-07-25",
      label: "3 days later",
    });
    expect(later[1]?.date).toBe("2026-08-12");
    expect(later[2]?.date).toBe("2026-10-22");

    const earlier = buildNaturalDateSuggestions("-1", { now });
    expect(earlier[0]).toMatchObject({
      date: "2026-07-21",
      label: "1 day earlier",
    });
  });

  it("returns no suggestions for blank or unparseable input", () => {
    expect(buildNaturalDateSuggestions("")).toEqual([]);
    expect(buildNaturalDateSuggestions("   ")).toEqual([]);
    expect(buildNaturalDateSuggestions("zzzzz not a date")).toEqual([]);
  });
});

describe("todayDateOnly", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("matches formatDateOnly for the current local date", () => {
    const now = new Date(2026, 0, 5, 9, 30, 0);
    vi.setSystemTime(now);
    expect(todayDateOnly()).toBe(formatDateOnly(now));
    expect(todayDateOnly()).toBe("2026-01-05");
  });
});
