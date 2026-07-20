import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";
import { compareBaselineToActualPng } from "../visual/compare-pixels.js";
import {
  actualPngPath,
  baselinePngPath,
  diffPngPath,
  sidecarJsonPath,
  sidecarPathForEntry,
  snapshotPublicRel,
} from "../visual/diff-result.js";
import { nestedSnapshotFileName } from "../visual/snapshot-paths.js";

function solidPng(width: number, height: number, rgba: [number, number, number, number]): Buffer {
  const png = new PNG({ width, height });
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    png.data[o] = rgba[0];
    png.data[o + 1] = rgba[1];
    png.data[o + 2] = rgba[2];
    png.data[o + 3] = rgba[3];
  }
  return PNG.sync.write(png);
}

describe("compareBaselineToActualPng", () => {
  it("reports zero diff for identical images", () => {
    const dir = path.join(tmpdir(), `vd-compare-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const baselinePath = path.join(dir, "baseline.png");
    const buf = solidPng(8, 8, [10, 20, 30, 255]);
    writeFileSync(baselinePath, buf);
    const result = compareBaselineToActualPng(baselinePath, buf);
    expect(result.diffPixels).toBe(0);
    expect(result.passed).toBe(true);
    expect(result.diffHistogram.every((n) => n === 0)).toBe(true);
    expect(result.changeBounds).toBeNull();
    expect(result.actualPng.length).toBeGreaterThan(0);
    expect(result.diffPng.length).toBeGreaterThan(0);
  });

  it("detects changed pixels and bounds", () => {
    const dir = path.join(tmpdir(), `vd-compare-diff-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const baselinePath = path.join(dir, "baseline.png");
    const baseline = solidPng(8, 8, [0, 0, 0, 255]);
    writeFileSync(baselinePath, baseline);
    const actualPng = new PNG({ width: 8, height: 8 });
    actualPng.data.fill(0);
    for (let i = 0; i < 8 * 8; i++) actualPng.data[i * 4 + 3] = 255;
    // Flip one pixel bright white
    actualPng.data[0] = 255;
    actualPng.data[1] = 255;
    actualPng.data[2] = 255;
    const result = compareBaselineToActualPng(
      baselinePath,
      PNG.sync.write(actualPng),
    );
    expect(result.diffPixels).toBeGreaterThan(0);
    expect(result.changeBounds).not.toBeNull();
    expect(result.diffHistogram.some((n) => n > 0)).toBe(true);
  });
});

describe("sidecar paths", () => {
  it("maps PNG basename to .json / .actual.png / .diff.png", () => {
    const baseline = "/tmp/shadcn/button/default-chromium-darwin.png";
    expect(sidecarJsonPath(baseline)).toBe(
      "/tmp/shadcn/button/default-chromium-darwin.json",
    );
    expect(actualPngPath(baseline)).toBe(
      "/tmp/shadcn/button/default-chromium-darwin.actual.png",
    );
    expect(diffPngPath(baseline)).toBe(
      "/tmp/shadcn/button/default-chromium-darwin.diff.png",
    );
    expect(
      snapshotPublicRel(
        "/repo/tests/visual/storybook.spec.ts-snapshots/shadcn/button/default-chromium-darwin.actual.png",
        "/repo",
      ),
    ).toBe("shadcn/button/default-chromium-darwin.actual.png");
  });

  it("builds nested chromium path for entry", () => {
    const entry = {
      id: "shadcn-button--default",
      importPath: "./src/shared/shadcn/button/Button.stories.svelte",
    };
    expect(nestedSnapshotFileName(entry, "chromium", "darwin")).toBe(
      "shadcn/button/default-chromium-darwin.png",
    );
    expect(sidecarPathForEntry(entry, "/repo", "chromium", "darwin")).toBe(
      path.join(
        "/repo",
        "tests/visual/storybook.spec.ts-snapshots",
        "shadcn/button/default-chromium-darwin.json",
      ),
    );
    expect(baselinePngPath(entry, "/repo", "chromium", "linux")).toContain(
      "default-chromium-linux.png",
    );
  });
});
