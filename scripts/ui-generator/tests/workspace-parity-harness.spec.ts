import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GeneratorError } from "../errors.js";
import { runWorkspaceParityHarness } from "../visual/workspace-parity-harness.js";

function reportDir(name: string) {
  const dir = path.join(tmpdir(), `workspace-parity-${name}-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

const boxCss = `
.box {
  background: rgb(20 20 20);
  height: 40px;
  width: 80px;
}
`;

describe("runWorkspaceParityHarness", () => {
  it("passes equivalent reference and candidate shots", async () => {
    const result = await runWorkspaceParityHarness({
      reportDir: reportDir("pass"),
      scenarios: [
        {
          id: "equivalent-box",
          viewport: { width: 160, height: 120 },
          maxDiffPixels: 0,
          reference: {
            css: boxCss,
            html: '<div data-parity-root class="box"></div>',
          },
          candidate: {
            css: boxCss,
            html: '<div data-parity-root class="box"></div>',
          },
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.scenarios).toEqual([
      {
        id: "equivalent-box",
        width: 80,
        height: 40,
        diffPixels: 0,
        maxDiffPixels: 0,
      },
    ]);
  });

  it("fails before pixel comparison when geometry differs", async () => {
    await expect(
      runWorkspaceParityHarness({
        reportDir: reportDir("geometry"),
        scenarios: [
          {
            id: "different-size",
            viewport: { width: 160, height: 120 },
            maxDiffPixels: 0,
            reference: {
              css: ".box{width:80px;height:40px;background:black}",
              html: '<div data-parity-root class="box"></div>',
            },
            candidate: {
              css: ".box{width:81px;height:40px;background:black}",
              html: '<div data-parity-root class="box"></div>',
            },
          },
        ],
      }),
    ).rejects.toBeInstanceOf(GeneratorError);
  });
});
