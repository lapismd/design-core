import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
const root = new URL("./", import.meta.url);
const files = readdirSync(root).filter((name) =>
  /\.(?:[jt]s|svelte)$/.test(name),
);
describe("standalone filter ownership and source limits", () => {
  it.each(files)("keeps %s within 300 physical lines", (name) => {
    expect(
      readFileSync(new URL(name, root), "utf8").split("\n").length - 1,
    ).toBeLessThanOrEqual(300);
  });
  it.each([
    "filter-builder.spec.ts",
    "canvas-table-filter.spec.ts",
    "canvas-table-filter-types.spec.ts",
  ])("keeps browser %s within 300 lines", (name) => {
    const source = readFileSync(
      new URL("../../../../tests/shadcn/" + name, import.meta.url),
      "utf8",
    );
    expect(source.split("\n").length - 1).toBeLessThanOrEqual(300);
  });
  it("keeps the strict consumer within 300 lines", () => {
    const source = readFileSync(
      new URL(
        "../../../../tests/source/structured-filter-consumer.svelte",
        import.meta.url,
      ),
      "utf8",
    );
    expect(source.split("\n").length - 1).toBeLessThanOrEqual(300);
  });
  it("keeps the standalone runtime and fixtures independent of tables and applications", () => {
    for (const name of files.filter((name) => !name.includes("spec"))) {
      const source = readFileSync(new URL(name, root), "utf8");
      expect(source, name).not.toMatch(
        /from\s+["'][^"']*(?:canvas-table|@lapis-notes|node:|\.\.\/forms|\.\.\/filter\/)/,
      );
      expect(source, name).not.toMatch(
        /globalThis\.app|localStorage|sessionStorage/,
      );
    }
  });
});
