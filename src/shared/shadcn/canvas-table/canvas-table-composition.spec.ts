import { describe, expect, it } from "vitest";
import { cellRect, createLayout } from "./canvas-table-layout.js";
import { hitTest } from "./canvas-table-hit.js";
import { toggleFiltered, toggleRow } from "./canvas-table-selection.js";
import { validateFilterState } from "../filter-builder/filter-builder-model.js";
import type { CanvasTableProps } from "./canvas-table-types.js";
import type {
  FilterField,
  StructuredFilterState,
} from "../filter-builder/index.js";

const rows = [
  { id: "a", cells: ["Alpha"] },
  { id: "b", cells: ["Beta"] },
  { id: "c", cells: ["Gamma"] },
];
const props = { rows, columnWidths: [160], headerRow: false };

describe("composable canvas geometry", () => {
  it("fills the actual scroller viewport without adding a scrollbar-width gap", () => {
    const layout = createLayout(
      { ...props, fillWidth: true },
      false,
      undefined,
      undefined,
      500,
    );
    expect(layout.width).toBe(500);
    expect(layout.widths[0]).toBe(500 - layout.gutter);
    expect(createLayout(props, false, undefined, undefined, 500).width).toBe(
      208,
    );
  });
  it("uses host density and header height in cell geometry and hit testing", () => {
    const layout = createLayout({
      ...props,
      rowHeight: 48,
      columnHeaderHeight: 96,
    } as CanvasTableProps);
    expect(cellRect(layout, 1, 0)).toMatchObject({ y: 144, height: 48 });
    expect(hitTest(layout, layout.gutter + 10, 145, 0, 0)).toMatchObject({
      kind: "body",
      index: 1,
    });
    expect(hitTest(layout, layout.gutter + 10, 60, 0, 0)).toMatchObject({
      kind: "letter",
    });
  });
  it("places measured details between data rows without enlarging data cells", () => {
    const layout = createLayout(
      { ...props, rowHeight: 36, expandedRowIds: ["a"] } as CanvasTableProps,
      false,
      undefined,
      new Map([["a", 140]]),
    );
    expect(cellRect(layout, 0, 0).height).toBe(36);
    expect(cellRect(layout, 1, 0).y - cellRect(layout, 0, 0).y).toBe(176);
    expect(hitTest(layout, layout.gutter + 10, 80, 0, 0)).toBeNull();
  });
  it("ignores detail measurements for collapsed or undisplayed rows", () => {
    const layout = createLayout(
      { ...props, visibleRowIds: ["b"] },
      false,
      undefined,
      new Map([["a", 140]]),
    );
    expect(layout.body).toHaveLength(1);
    expect(layout.height).toBe(
      createLayout({ ...props, visibleRowIds: ["b"] }).height,
    );
    expect(layout.body[0]?.number).toBe(2);
  });
});

describe("required and scoped selection", () => {
  it("preserves hidden selections while toggling every filtered row across pages", () => {
    expect(toggleFiltered(["hidden"], ["a", "b", "c"])).toEqual([
      "hidden",
      "a",
      "b",
      "c",
    ]);
    expect(toggleFiltered(["hidden", "a", "b", "c"], ["a", "b", "c"])).toEqual([
      "hidden",
    ]);
  });
  it("prevents clearing the final required selection", () => {
    expect(toggleRow(["a"], "a", { required: true })).toEqual(["a"]);
    expect(toggleFiltered(["a"], ["a"], { required: true })).toEqual(["a"]);
  });
  it("supports single optional and required selection", () => {
    expect(toggleRow(["a"], "b", { mode: "single" })).toEqual(["b"]);
    expect(toggleRow(["a"], "a", { mode: "single" })).toEqual([]);
    expect(toggleRow(["a"], "a", { mode: "single", required: true })).toEqual([
      "a",
    ]);
  });
  it("ignores selection attempts while disabled", () => {
    expect(toggleRow(["a"], "b", { disabled: true })).toEqual(["a"]);
    expect(toggleFiltered(["a"], ["b"], { disabled: true })).toEqual(["a"]);
  });
});

describe("authoritative custom validation", () => {
  const value: StructuredFilterState = {
    root: {
      id: "root",
      kind: "group",
      match: "all",
      children: [
        {
          id: "condition",
          kind: "condition",
          field: "amount",
          operator: "exact",
          value: "1" + "0".repeat(400),
        },
      ],
    },
    types: {},
  };
  const field = {
    id: "amount",
    label: "Amount",
    type: "number",
    operators: [
      {
        id: "exact",
        label: "Equals",
        value: "single",
        validation: "custom",
        validate: (input: unknown) =>
          /^\d+$/.test(String(input)) ? null : "Enter an integer.",
      },
    ],
  } as FilterField;
  it("preserves precise numeric literals outside JavaScript Number range", () => {
    expect(validateFilterState(value, [field])).toEqual({});
  });
  it("requires an explicit validator in custom mode", () => {
    const invalid = {
      ...field,
      operators: [{ ...field.operators![0]!, validate: undefined }],
    };
    expect(validateFilterState(value, [invalid]).condition).toMatch(
      /validator/i,
    );
  });
  it("preserves default numeric validation without custom mode", () => {
    const normal = {
      ...field,
      operators: [{ ...field.operators![0]!, validation: undefined }],
    };
    expect(validateFilterState(value, [normal]).condition).toBeTruthy();
  });
});
