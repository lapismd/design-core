import { describe, expect, it } from "vitest";
import { inferCanvasTableColumnTypes } from "./canvas-table-filter-inference.js";

function infer(values: string[], sampleSize = 100) {
  return inferCanvasTableColumnTypes(
    [
      { id: "header", cells: ["A"] },
      ...values.map((value, index) => ({ id: index, cells: [value] })),
    ],
    { columnCount: 1, sampleSize },
  )[0];
}
describe("bounded conservative Canvas Table inference", () => {
  it.each([
    [["", "  ", "0", "-1.2", "1e3"], "number"],
    [["TRUE", "false", ""], "boolean"],
    [["2024-02-29", "2026-10-31"], "date"],
    [["2026-10-31T12:30:00Z", "2026-10-31T13:30:00+01:00"], "datetime"],
    [["0012", "0013"], "text"],
    [["1", "true"], "text"],
    [["2026-02-30"], "text"],
    [["01/02/2026"], "text"],
    [["2026-10-31T12:30"], "text"],
    [["", " "], "text"],
    [["Open", "Closed", "Open"], "text"],
    [["0", "1"], "number"],
    [["Infinity", "NaN"], "text"],
  ])("detects %s as %s", (values, expected) => {
    expect(infer(values as string[])).toBe(expected);
  });
  it("examines exactly the bounded first source rows, including blanks", () => {
    expect(infer([...Array<string>(100).fill(""), "12"])).toBe("text");
    expect(infer([...Array<string>(100).fill("12"), "text"])).toBe("number");
    expect(infer(["3", "x"], 1)).toBe("number");
  });
  it("handles no header, missing cells and empty datasets", () => {
    expect(
      inferCanvasTableColumnTypes([{ id: "a", cells: ["1"] }], {
        columnCount: 2,
        headerRow: false,
      }),
    ).toEqual(["number", "text"]);
    expect(inferCanvasTableColumnTypes([], { columnCount: 1 })).toEqual([
      "text",
    ]);
  });
  it.each([0, -1, 1.5, Infinity])(
    "rejects an invalid bound %s",
    (sampleSize) => {
      expect(() => infer(["1"], sampleSize)).toThrow(RangeError);
    },
  );
});
