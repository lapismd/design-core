import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../packages/storybook-addon-visual-delta",
);

describe("packaged Visual Delta preset (Storybook 10 contract)", () => {
  it("does not re-register manager/preview (bare package owns those)", () => {
    const presetSource = readFileSync(
      path.join(packageRoot, "src/preset.ts"),
      "utf8",
    );
    // Storybook 10 resolveAddonName already loads package `./manager` +
    // `./preview` when addons lists the package name. Exporting the same
    // hooks from the preset duplicates the module declaration.
    expect(presetSource).not.toMatch(/export function managerEntries\b/);
    expect(presetSource).not.toMatch(/export function previewAnnotations\b/);
    expect(presetSource).toMatch(/export function staticDirs\b/);
    expect(presetSource).toMatch(/export async function viteFinal\b/);
  });
});
