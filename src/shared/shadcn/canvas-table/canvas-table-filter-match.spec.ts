import { describe, expect, it } from "vitest";
import { createFilterState } from "../filter-builder/filter-builder-model.js";
import type {
  FilterCondition,
  FilterType,
} from "../filter-builder/filter-builder-types.js";
import {
  filteredCanvasTableIds,
  type CanvasTableResolvedField,
} from "./canvas-table-filter-match.js";
import type { CanvasTableProps } from "./canvas-table-types.js";

function run(
  operator: string,
  value: FilterCondition["value"],
  type: FilterType = "text",
  cells = ["Alpha", "Beta", "", "alphabet"],
) {
  const state = createFilterState();
  state.root.children = [
    { id: "rule", kind: "condition", field: "a", operator, value },
  ];
  const fields: CanvasTableResolvedField[] = [
    { id: "a", label: "A", type, column: 0 },
  ];
  const props: CanvasTableProps = {
    rows: [
      { id: "header", cells: ["A"] },
      ...cells.map((cell, id) => ({ id, cells: [cell] })),
    ],
    columnWidths: [120],
    filtering: { value: state, onValueChange: () => {} },
  };
  return { fields, props, result: () => filteredCanvasTableIds(props, fields) };
}
describe("Canvas Table structured matching and order", () => {
  it.each([
    ["contains", "ALP", [0, 3]],
    ["not-contains", "alp", [1, 2]],
    ["eq", "alpha", [0]],
    ["neq", "alpha", [1, 2, 3]],
    ["starts-with", "alp", [0, 3]],
    ["ends-with", "bet", [3]],
    ["contains-any", ["alp", "bet"], [0, 1, 3]],
    ["contains-all", ["alp", "bet"], [3]],
    ["not-contains-all", ["alp", "bet"], [0, 1, 2]],
    ["empty", "", [2]],
    ["not-empty", "", [0, 1, 3]],
  ])("matches literal text %s", (operator, value, expected) => {
    expect(
      run(String(operator), value as FilterCondition["value"]).result(),
    ).toEqual(expected);
  });
  it("combines host visibility without changing its order or the source", () => {
    const test = run("contains", "alp");
    test.props.visibleRowIds = [3, "header", 0, 1];
    expect(test.result()).toEqual([3, 0]);
    expect(test.props.rows.map((row) => row.id)).toEqual([
      "header",
      0,
      1,
      2,
      3,
    ]);
  });
  it("does not coerce unsampled invalid numbers for negative comparisons", () => {
    expect(
      run("neq", 0, "number", ["0", "1", "not a number", ""]).result(),
    ).toEqual([1]);
  });
  it("supports zero, false and chronological instant comparison", () => {
    expect(
      run("eq", false, "boolean", ["true", "false", "0", ""]).result(),
    ).toEqual([1]);
    expect(run("gte", 0, "number", ["-1", "0", "2"]).result()).toEqual([1, 2]);
    expect(
      run("eq", "2026-10-31T12:00:00Z", "datetime", [
        "2026-10-31T13:00:00+01:00",
        "2026-10-31T12:01:00Z",
      ]).result(),
    ).toEqual([0]);
  });
  it("supports nested Any and None without counting an empty group as a constraint", () => {
    const test = run("contains", "alp");
    const root = test.props.filtering!.value.root;
    root.match = "any";
    root.children.push({
      id: "empty",
      kind: "group",
      match: "none",
      children: [],
    });
    expect(test.result()).toEqual([0, 3]);
    root.match = "none";
    expect(test.result()).toEqual([1, 2]);
  });
  it("matches an empty filter and supports tables without fixed headers", () => {
    const test = run("eq", "alpha");
    test.props.filtering!.value = createFilterState();
    expect(test.result()).toEqual([0, 1, 2, 3]);
    test.props.headerRow = false;
    expect(test.result()).toEqual(["header", 0, 1, 2, 3]);
  });
  it("does not silently bind a removed stable field ID to another column", () => {
    const test = run("eq", "alpha");
    test.fields[0]!.id = "other";
    expect(test.result()).toEqual([]);
  });
  it("keeps literal query-looking text literal", () => {
    expect(
      run("contains", "OR 1=1", "text", ["OR 1=1", "other"]).result(),
    ).toEqual([0]);
  });
});
