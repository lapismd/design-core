import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const referenceRoot = path.join(repoRoot, "reference/lapis/workspace-shell");

const expectedHashes = {
  "provenance.json":
    "853b8fe4e84fa1915018c3055ea8ed88796aaabec944782fafcff423e70ec5b2",
  "workspace-shell-dark.png":
    "7b4b1f94d61a7efeb725ddf0c56b024853be5873da76f24be517878c28f09985",
  "workspace-shell-light.png":
    "612902f9da1b729f94a94e15057296cad752cafeab26435f2bed017a6735a28e",
} as const;

async function sha256(file: string): Promise<string> {
  const bytes = await readFile(path.join(referenceRoot, file));
  return createHash("sha256").update(bytes).digest("hex");
}

describe("canonical Lapis workspace reference", () => {
  it("retains the reviewed immutable artifacts", async () => {
    for (const [file, expected] of Object.entries(expectedHashes)) {
      await expect(sha256(file)).resolves.toBe(expected);
    }
  });

  it("retains the source capture geometry and provenance", async () => {
    for (const theme of ["light", "dark"] as const) {
      const image = PNG.sync.read(
        await readFile(
          path.join(referenceRoot, `workspace-shell-${theme}.png`),
        ),
      );
      expect({ width: image.width, height: image.height }).toEqual({
        width: 1440,
        height: 960,
      });
    }

    const provenance = JSON.parse(
      await readFile(path.join(referenceRoot, "provenance.json"), "utf8"),
    ) as {
      sourceRevision: string;
      viewport: { width: number; height: number };
      deviceScaleFactor: number;
      themes: string[];
      visualDelta: { canonicalImmutable: boolean };
    };
    expect(provenance).toMatchObject({
      sourceRevision: "a371198e495d9e4e465c2960a04b3a4fd11f4023",
      viewport: { width: 1440, height: 960 },
      deviceScaleFactor: 1,
      themes: ["light", "dark"],
      visualDelta: { canonicalImmutable: true },
    });
  });

  it("serves both references only through the review story", async () => {
    const [storybookConfig, story] = await Promise.all([
      readFile(path.join(repoRoot, ".storybook/main.ts"), "utf8"),
      readFile(
        path.join(
          repoRoot,
          "src/shared/workspace/reference/WorkspaceReference.stories.svelte",
        ),
        "utf8",
      ),
    ]);

    expect(storybookConfig).toContain(
      'from: "../reference/lapis/workspace-shell"',
    );
    expect(storybookConfig).toContain('to: "/lapis-reference"');
    expect(story).toContain('"lapis-reference-visual"');
    expect(story).toContain("/lapis-reference/workspace-shell-light.png");
    expect(story).toContain("/lapis-reference/workspace-shell-dark.png");
    expect(story).toContain(
      "/visual-baselines/workspace/reference/shell-chromium-darwin.png",
    );
  });
});
