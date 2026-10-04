import { describe, expect, it } from "vitest";
import {
  resolveColumnCanvasPinning,
  type PinningColumn,
} from "./column-canvas-pinning.js";
const column = (
  id: string,
  kind: PinningColumn["kind"],
  overrides: Partial<PinningColumn> = {},
): PinningColumn => ({
  id,
  kind,
  width: 240,
  minWidth: 180,
  expanded: true,
  marginStart: 0,
  marginEnd: 0,
  ...overrides,
});
const options = {
  mode: "fixed" as const,
  availableWidth: 1000,
  gap: 12,
  railWidth: 44,
  contextWidth: 44,
  activePairLeadingId: null,
};
describe("fixed column capacity and offsets", () => {
  it("preserves full widths and spacing for leading fixed columns", () => {
    expect(
      resolveColumnCanvasPinning(
        [column("a", "fixed"), column("b", "fixed"), column("c", null)],
        options,
      ),
    ).toEqual({
      slots: [
        { id: "a", kind: "fixed", width: 240, offset: 0 },
        { id: "b", kind: "fixed", width: 240, offset: 252 },
      ],
      extent: 492,
      prefixLength: 2,
    });
  });
  it("releases trailing pins and restores them without changing inputs", () => {
    const columns = [
      column("a", "fixed"),
      column("b", "fixed"),
      column("c", "sticky"),
      column("d", null),
    ];
    const before = structuredClone(columns);
    expect(
      resolveColumnCanvasPinning(columns, {
        ...options,
        availableWidth: 600,
      }).slots.map((s) => s.id),
    ).toEqual(["a"]);
    expect(
      resolveColumnCanvasPinning(columns, { ...options, availableWidth: 400 })
        .slots,
    ).toEqual([]);
    expect(
      resolveColumnCanvasPinning(columns, options).slots.map((s) => s.id),
    ).toEqual(["a", "b", "c"]);
    expect(columns).toEqual(before);
  });
  it("uses a collapsed rail's actual width and consumer margins", () => {
    const result = resolveColumnCanvasPinning(
      [
        column("a", "fixed", {
          expanded: false,
          width: 50,
          marginStart: 8,
          marginEnd: 6,
        }),
        column("b", "fixed"),
      ],
      options,
    );
    expect(result.slots.map((s) => s.offset)).toEqual([8, 76]);
    expect(result.extent).toBe(316);
  });
  it("mixes full fixed slots with compact sticky slots and retains gapless sticky-only rails", () => {
    expect(
      resolveColumnCanvasPinning(
        [column("a", "sticky"), column("b", "fixed"), column("c", "sticky")],
        options,
      ).slots.map((s) => [s.width, s.offset]),
    ).toEqual([
      [44, 0],
      [240, 56],
      [44, 308],
    ]);
    expect(
      resolveColumnCanvasPinning(
        [column("a", "sticky"), column("b", "sticky")],
        { ...options, availableWidth: 1 },
      ).extent,
    ).toBe(88);
  });
  it("stops at ordinary columns and disables pinning in compact mode", () => {
    expect(
      resolveColumnCanvasPinning(
        [column("a", null), column("b", "fixed")],
        options,
      ).slots,
    ).toEqual([]);
    expect(
      resolveColumnCanvasPinning([column("a", "fixed")], {
        ...options,
        mode: "compact",
      }).slots,
    ).toEqual([]);
  });
  it("reserves the widest minimum in free scrolling and both active pair minimums in wide mode", () => {
    const columns = [
      column("a", "fixed"),
      column("b", null, { minWidth: 300 }),
      column("c", null, { minWidth: 320 }),
    ];
    expect(
      resolveColumnCanvasPinning(columns, { ...options, availableWidth: 600 })
        .slots,
    ).toHaveLength(1);
    expect(
      resolveColumnCanvasPinning(columns, {
        ...options,
        availableWidth: 800,
        mode: "wide",
      }).slots,
    ).toHaveLength(0);
    expect(
      resolveColumnCanvasPinning(columns, {
        ...options,
        availableWidth: 884,
        mode: "wide",
      }).slots,
    ).toHaveLength(1);
  });
  it("includes intervening collapsed widths and context in wide stage capacity", () => {
    const columns = [
      column("a", "fixed"),
      column("b", null),
      column("c", null),
      column("rail", null, { expanded: false, width: 44 }),
      column("d", null),
    ];
    expect(
      resolveColumnCanvasPinning(columns, {
        ...options,
        availableWidth: 700,
        mode: "wide",
      }).slots,
    ).toHaveLength(0);
    expect(
      resolveColumnCanvasPinning(columns, {
        ...options,
        availableWidth: 740,
        mode: "wide",
      }).slots,
    ).toHaveLength(1);
  });
});
