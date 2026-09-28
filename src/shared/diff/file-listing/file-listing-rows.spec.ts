import { describe, expect, it } from "vitest";
import { fileListingRows } from "./file-listing-rows.js";

const files = [
  { path: "README.md" },
  { path: "src/index.ts" },
  { path: "src/lib/tree.ts" },
];

describe("fileListingRows", () => {
  it("keeps stable file rows in list mode", () => {
    expect(
      fileListingRows(files, "list", new Set()).map((row) => row.key),
    ).toEqual(["file:README.md", "file:src/index.ts", "file:src/lib/tree.ts"]);
  });

  it("flattens only expanded tree rows with their native depth", () => {
    expect(
      fileListingRows(files, "tree", new Set(["src/lib"])).map((row) => [
        row.kind,
        row.path,
        row.depth,
      ]),
    ).toEqual([
      ["directory", "src", 0],
      ["directory", "src/lib", 1],
      ["file", "src/index.ts", 1],
      ["file", "README.md", 0],
    ]);
  });

  it("renders unloaded host-owned directories without inventing child files", () => {
    expect(
      fileListingRows([{ path: "README.md" }], "tree", new Set(["src"]), [
        { path: "src" },
        { path: "docs/reference" },
      ]).map((row) => [row.kind, row.path, row.depth]),
    ).toEqual([
      ["directory", "docs", 0],
      ["directory", "docs/reference", 1],
      ["directory", "src", 0],
      ["file", "README.md", 0],
    ]);
  });
});
