import { describe, expect, it } from "vitest";
import {
  createFilterState,
  normalizeFilterState,
  validateFilterState,
  filterConditionCount,
  effectiveFieldType,
} from "./filter-builder-model.js";
import type { FilterField, FilterCondition } from "./filter-builder-types.js";

const fields: FilterField[] = [
  { id: "name", label: "Name", type: "text", allowTypeOverride: true },
  { id: "amount", label: "Amount", type: "number" },
  { id: "done", label: "Done", type: "boolean" },
  { id: "date", label: "Date", type: "date" },
];
function state(
  field: string,
  value: FilterCondition["value"],
  operator = "eq",
) {
  const next = createFilterState();
  next.root.children.push({
    id: "row",
    kind: "condition",
    field,
    operator,
    value,
  });
  return next;
}

describe("standalone structured filter values", () => {
  it("creates independent empty All roots", () => {
    const a = createFilterState();
    const b = createFilterState();
    a.types.name = "number";
    expect(b.types).toEqual({});
    expect(b.root.match).toBe("all");
    expect(filterConditionCount(b)).toBe(0);
  });
  it.each([
    ["amount", 0],
    ["done", false],
    ["name", "literal (x) OR 1=1"],
  ])("accepts a literal %s value %s", (field, value) =>
    expect(validateFilterState(state(String(field), value!), fields)).toEqual(
      {},
    ),
  );
  it.each(["", "-", "12 dollars", "Infinity"])(
    "rejects invalid numeric draft %s",
    (value) => {
      expect(
        validateFilterState(state("amount", value), fields).row,
      ).toBeTruthy();
    },
  );
  it.each(["2024-02-29", "2026-10-31"])("accepts real ISO date %s", (value) => {
    expect(validateFilterState(state("date", value), fields)).toEqual({});
  });
  it.each(["2026-02-30", "01/02/2026", "2026-13-01"])(
    "rejects ambiguous date %s",
    (value) => {
      expect(
        validateFilterState(state("date", value), fields).row,
      ).toBeTruthy();
    },
  );
  it("validates none-value empty checks without requiring text", () => {
    expect(validateFilterState(state("name", "", "empty"), fields)).toEqual({});
  });
  it("retains invalid nonpristine rows while excluding pristine new rows", () => {
    const next = state("name", "");
    const pristine = normalizeFilterState(next, new Set(["row"]));
    expect(pristine.root.children).toEqual([]);
    expect(next.root.children).toHaveLength(1);
    expect(validateFilterState(next, fields).row).toBeTruthy();
  });
  it("removes empty nested groups for All, Any and None", () => {
    const next = createFilterState();
    next.root.children = ["all", "any", "none"].map((match) => ({
      id: match,
      kind: "group",
      match: match as "all" | "any" | "none",
      children: [],
    }));
    expect(normalizeFilterState(next).root.children).toEqual([]);
  });
  it("uses overrides only when the host permits them", () => {
    const next = createFilterState();
    next.types = { name: "number", amount: "text" };
    expect(effectiveFieldType(fields[0]!, next)).toBe("number");
    expect(effectiveFieldType(fields[1]!, next)).toBe("number");
  });
  it("identifies missing fields instead of rebinding another column", () => {
    expect(validateFilterState(state("deleted", "x"), fields).row).toContain(
      "field",
    );
  });
  it("rejects an incompatible operator and empty multiple values", () => {
    expect(
      validateFilterState(state("amount", 4, "contains"), fields).row,
    ).toBeTruthy();
    expect(
      validateFilterState(state("name", [], "contains-any"), fields).row,
    ).toBeTruthy();
  });
  it("counts leaves through nested groups", () => {
    const next = state("name", "a");
    next.root.children.push({
      id: "g",
      kind: "group",
      match: "none",
      children: state("amount", 1).root.children,
    });
    expect(filterConditionCount(next)).toBe(2);
  });
});
