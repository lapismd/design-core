import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const family = new URL("./", import.meta.url);
const files = readdirSync(family).filter((file) =>
  /\.(?:[cm]?[jt]s|svelte)$/.test(file),
);

describe("Canvas Table maintained source boundaries", () => {
  it.each(files)("keeps %s at or below 300 physical lines", (file) => {
    const source = readFileSync(new URL(file, family), "utf8");
    const lines = source.split("\n").length - Number(source.endsWith("\n"));
    expect(lines, fileURLToPath(new URL(file, family))).toBeLessThanOrEqual(
      300,
    );
  });
  it.each(["canvas-table.spec.ts", "canvas-table-interactions.spec.ts"])(
    "keeps %s below 300 lines",
    (file) => {
      const source = readFileSync(
        new URL("../../../../tests/shadcn/" + file, import.meta.url),
        "utf8",
      );
      expect(
        source.split("\n").length - Number(source.endsWith("\n")),
      ).toBeLessThanOrEqual(300);
    },
  );
  it("keeps the strict public consumer below 300 lines", () => {
    const source = readFileSync(
      new URL(
        "../../../../tests/source/canvas-table-consumer.svelte",
        import.meta.url,
      ),
      "utf8",
    );
    expect(
      source.split("\n").length - Number(source.endsWith("\n")),
    ).toBeLessThanOrEqual(300);
  });
  it("does not import CSV, application, filesystem or persistence contracts", () => {
    for (const file of files.filter(
      (name) => !/stories|spec|example/.test(name),
    )) {
      const source = readFileSync(new URL(file, family), "utf8");
      expect(source, file).not.toMatch(
        /(?:from|import)\s*["'][^"']*(?:@lapis-notes|csv|node:|workspace|forms\/)/,
      );
      expect(source, file).not.toMatch(
        /globalThis\.app|sessionStorage|localStorage/,
      );
    }
  });
});
