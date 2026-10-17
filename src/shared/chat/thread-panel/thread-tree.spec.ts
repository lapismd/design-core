import { describe, it, expect } from "vitest";
import { projectThreadTree } from "./thread-tree.js";
describe("thread projection", () => {
  it("keeps sibling order and visits descendants before later siblings", () => {
    const rows = projectThreadTree(
      [
        { id: "root" },
        { id: "first", parentId: "root" },
        { id: "second", parentId: "root" },
        { id: "nested", parentId: "first" },
      ],
      "root",
    );
    expect(rows.map((r) => r.message.id)).toEqual([
      "root",
      "first",
      "nested",
      "second",
    ]);
    expect(rows.map((r) => r.depth)).toEqual([0, 1, 2, 1]);
    expect(rows[2]!.connectorIndentRem).toBe(0);
  });
  it("retains orphans, missing roots, self links and cycles without duplication", () => {
    const nodes = [
      { id: "a", parentId: "b" },
      { id: "b", parentId: "a" },
      { id: "self", parentId: "self" },
      { id: "orphan", parentId: "missing" },
    ];
    const rows = projectThreadTree(nodes, "root");
    expect(rows.map((r) => r.message.id)).toEqual(["a", "b", "self", "orphan"]);
  });
  it("bounds visual depth and remains iterative for long reply chains", () => {
    const nodes = Array.from({ length: 12000 }, (_, i) => ({
      id: String(i),
      parentId: i ? String(i - 1) : undefined,
    }));
    const rows = projectThreadTree(nodes, "0");
    expect(rows).toHaveLength(12000);
    expect(rows.at(-1)!.indentRem).toBe(13.5);
  });
});
