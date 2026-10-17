import { describe, it, expect } from "vitest";
import { formatRelativeTime } from "./relative-time.js";
const now = Date.parse("2026-10-17T12:00:00Z");
describe("relative date display", () => {
  it("formats past and future using a supplied clock", () => {
    expect(
      formatRelativeTime(now - 300000, { now, locale: "en-GB" }).text,
    ).toBe("5 minutes ago");
    expect(
      formatRelativeTime(now + 300000, { now, locale: "en-GB" }).text,
    ).toBe("in 5 minutes");
  });
  it("retains exact ISO dates and handles invalid input", () => {
    expect(formatRelativeTime(now, { now }).datetime).toBe(
      "2026-10-17T12:00:00.000Z",
    );
    for (const value of ["invalid", NaN, Infinity, 1e20])
      expect(formatRelativeTime(value, { now }).text).toBe("Unknown date");
  });
  it("switches older dates to the supplied absolute threshold", () => {
    expect(
      formatRelativeTime("2026-01-01T00:00:00Z", { now, locale: "en-GB" }).text,
    ).toBe("1 Jan 2026");
  });
});
