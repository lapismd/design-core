import { describe, expect, it } from "vitest";
import {
  asObjectMap,
  asObjectRows,
  createObjectRow,
  defaultPropertyValue,
  nextObjectMapKey,
} from "./object-collection.js";

describe("object collection helpers", () => {
  it("fills missing property defaults by type", () => {
    expect(
      createObjectRow([
        { id: "id", title: "ID", type: "string", required: true },
        { id: "width", title: "Width", type: "integer", default: 160 },
        { id: "visible", title: "Visible", type: "boolean" },
      ]),
    ).toEqual({
      id: "",
      width: 160,
      visible: false,
    });
    expect(
      defaultPropertyValue({ id: "count", title: "Count", type: "number" }),
    ).toBe(0);
  });

  it("normalizes array and map values and allocates unused map keys", () => {
    expect(asObjectRows([{ id: "title" }, "skip"])).toEqual([
      { id: "title" },
      {},
    ]);
    expect(asObjectMap({ default: { label: "Default" }, bad: 1 })).toEqual({
      default: { label: "Default" },
      bad: {},
    });
    expect(nextObjectMapKey({ "item-1": {} })).toBe("item-2");
  });
});
