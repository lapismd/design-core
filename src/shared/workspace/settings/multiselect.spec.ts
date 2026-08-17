import { describe, expect, it } from "vitest";

import {
  filterMultiSelectItems,
  orderSelectedFirst,
  summarizeMultiSelectIds,
} from "./multiselect.js";

const items = [
  { value: "left", label: "Left sidebar", description: "Primary navigation rail" },
  { value: "right", label: "Right sidebar", description: "Secondary inspector rail" },
  { value: "status", label: "Status bar", description: "Footer status items" },
];

describe("settings multi-select helpers", () => {
  it("summarizes selected ids and overflow", () => {
    expect(summarizeMultiSelectIds([], "Select options...")).toBe(
      "Select options...",
    );
    expect(summarizeMultiSelectIds(["MD013"], "Select options...")).toBe(
      "MD013",
    );
    expect(
      summarizeMultiSelectIds(["MD013", "MD041"], "Select options..."),
    ).toBe("MD013, MD041");
    expect(
      summarizeMultiSelectIds(
        ["MD013", "MD041", "MD018"],
        "Select options...",
      ),
    ).toBe("MD013, MD041 + 1 more");
  });

  it("keeps selected options first while preserving catalog order", () => {
    expect(
      orderSelectedFirst(items, ["left", "status"]).map((item) => item.value),
    ).toEqual(["left", "status", "right"]);
  });

  it("filters by value, label, and description before sorting", () => {
    const matches = filterMultiSelectItems(items, "inspector");
    expect(matches.map((item) => item.value)).toEqual(["right"]);
    expect(
      orderSelectedFirst(filterMultiSelectItems(items, "rail"), ["right"]).map(
        (item) => item.value,
      ),
    ).toEqual(["right", "left"]);
  });
});
