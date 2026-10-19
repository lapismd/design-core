import { describe, expect, it } from "vitest";
import { statusOverflow } from "./status-overflow.js";

const items = [
  { id: "repository", priority: 20 },
  { id: "custom", priority: 0 },
  { id: "notifications", priority: 10000 },
];
const widths = new Map(items.map((item) => [item.id, 40]));
describe("status overflow", () => {
  it("leaves all contributions visible when they fit", () => {
    expect([...statusOverflow(items, widths, 128)]).toEqual([]);
  });
  it("retains higher priority controls and reserves the overflow trigger", () => {
    expect([...statusOverflow(items, widths, 70)]).toEqual([
      "custom",
      "repository",
    ]);
  });
  it("retains earlier registration order for equal priorities", () => {
    expect([
      ...statusOverflow(
        [{ id: "a" }, { id: "b" }],
        new Map([
          ["a", 40],
          ["b", 40],
        ]),
        68,
      ),
    ]).toEqual(["b"]);
  });
});
