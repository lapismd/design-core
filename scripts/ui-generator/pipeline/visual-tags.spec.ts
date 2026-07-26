import { describe, expect, it } from "vitest";
import { normalizeStoryIdPrefix } from "./visual-tags.js";

describe("normalizeStoryIdPrefix", () => {
  it("adds trailing -- for bare heads", () => {
    expect(normalizeStoryIdPrefix("shadcn-button")).toBe("shadcn-button--");
  });

  it("keeps trailing - groups as-is when already hyphen-terminated", () => {
    expect(normalizeStoryIdPrefix("shadcn-actions-")).toBe("shadcn-actions-");
  });

  it("derives prefix from a full story id", () => {
    expect(normalizeStoryIdPrefix("shadcn-button--default")).toBe(
      "shadcn-button--",
    );
  });

  it("accepts an explicit prefix ending in --", () => {
    expect(normalizeStoryIdPrefix("shadcn-button--")).toBe("shadcn-button--");
  });
});
