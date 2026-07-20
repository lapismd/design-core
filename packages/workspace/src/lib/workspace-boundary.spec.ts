import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.dirname(fileURLToPath(import.meta.url));

function workspaceSources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return workspaceSources(file);
    if (
      !entry.isFile() ||
      entry.name.endsWith(".stories.svelte") ||
      entry.name.endsWith(".spec.ts")
    ) {
      return [];
    }
    return [file];
  });
}

describe("workspace package boundary", () => {
  it("does not pull application or Tailwind styling dependencies into the reusable kernel", () => {
    const source = workspaceSources(root)
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(source).not.toMatch(/@lapis-notes\//);
    expect(source).not.toMatch(/tailwind-variants|tailwind-merge/);
    expect(source).not.toMatch(/\bcn\s*\(/);
  });
});
