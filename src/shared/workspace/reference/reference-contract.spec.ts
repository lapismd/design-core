import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const referenceRoot = path.join(repoRoot, "reference/lapis/workspace-shell");
const storybookReferenceRoot = path.join(referenceRoot, "storybook");
const storybookV2ReferenceRoot = path.join(referenceRoot, "storybook-v2");

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

async function storybookInventorySha256(): Promise<string> {
  const files = (await readdir(storybookReferenceRoot))
    .filter((file) => file.endsWith(".png"))
    .sort();
  const inventory = await Promise.all(
    files.map(async (file) => {
      const bytes = await readFile(path.join(storybookReferenceRoot, file));
      return `${createHash("sha256").update(bytes).digest("hex")}  ${file}`;
    }),
  );
  return createHash("sha256")
    .update(`${inventory.join("\n")}\n`)
    .digest("hex");
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

  it("retains the immutable source Storybook snapshot inventory", async () => {
    const provenance = JSON.parse(
      await readFile(
        path.join(storybookReferenceRoot, "provenance.json"),
        "utf8",
      ),
    ) as {
      sourceSnapshotRevision: string;
      capture: {
        viewport: { width: number; height: number };
        deviceScaleFactor: number;
      };
      assetCount: number;
      inventorySha256: string;
      canonicalImmutable: boolean;
      wiredComparisons: Array<{ source: string; targetStoryId: string }>;
    };
    const files = (await readdir(storybookReferenceRoot)).filter((file) =>
      file.endsWith(".png"),
    );

    expect(files).toHaveLength(52);
    expect(provenance).toMatchObject({
      sourceSnapshotRevision: "b06d1e3f58c3",
      capture: {
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 3,
      },
      assetCount: 52,
      inventorySha256:
        "9a8556f6cd124460b0026a7e605f7d98dd5ff57085cd694d0b1fc9e52bcdeb83",
      canonicalImmutable: true,
    });
    expect(provenance.wiredComparisons).toHaveLength(20);
    const storySources = (
      await Promise.all(
        [
          "demo/ReusableFrameworkDemo.stories.svelte",
          "drop-overlay/WorkspaceDropOverlay.stories.svelte",
          "empty/WorkspaceEmpty.stories.svelte",
          "floating-layer/WorkspaceFloatingLayer.stories.svelte",
          "plugins/f-mode/FMode.stories.svelte",
          "plugins/notifications/Notifications.stories.svelte",
          "settings/WorkspaceSettings.stories.svelte",
          "sidebar/WorkspaceSidebar.stories.svelte",
          "sidebar-group/WorkspaceSidebarGroup.stories.svelte",
          "stacked-tabs/WorkspaceStackedTabs.stories.svelte",
          "tabs/WorkspaceTabs.stories.svelte",
          "view-header/WorkspaceViewHeader.stories.svelte",
          "view-host/WorkspaceViewHost.stories.svelte",
        ].map((file) =>
          readFile(path.join(repoRoot, "src/shared/workspace", file), "utf8"),
        ),
      )
    ).join("\n");
    for (const mapping of provenance.wiredComparisons) {
      expect(files).toContain(mapping.source);
      expect(storySources).toContain(mapping.source);
    }
    await expect(storybookInventorySha256()).resolves.toBe(
      provenance.inventorySha256,
    );
  });

  it("retains the guarded CY-0004 v2 parity inventory and complete crosswalk", async () => {
    const [provenance, manifest, crosswalk, packageJson] = await Promise.all([
      readFile(
        path.join(storybookV2ReferenceRoot, "provenance.json"),
        "utf8",
      ).then(JSON.parse),
      readFile(
        path.join(storybookV2ReferenceRoot, "manifest.json"),
        "utf8",
      ).then(JSON.parse),
      readFile(
        path.join(storybookV2ReferenceRoot, "crosswalk.json"),
        "utf8",
      ).then(JSON.parse),
      readFile(path.join(repoRoot, "package.json"), "utf8"),
    ]);
    const files = (
      await Promise.all(
        ["light", "dark"].map(async (mode) =>
          (await readdir(path.join(storybookV2ReferenceRoot, mode)))
            .filter((file) => file.endsWith(".png"))
            .map((file) => `${mode}/${file}`),
        ),
      )
    )
      .flat()
      .sort();
    const inventory = await Promise.all(
      files.map(async (file) => {
        const bytes = await readFile(path.join(storybookV2ReferenceRoot, file));
        return `${createHash("sha256").update(bytes).digest("hex")}  ${file}`;
      }),
    );
    const inventoryHash = createHash("sha256")
      .update(`${inventory.join("\n")}\n`)
      .digest("hex");

    expect(files).toHaveLength(104);
    expect(inventoryHash).toBe(
      "76dc05493ebeae2cf8635efef77d8c5735dcb1a7453838091e44a0f50e89d78e",
    );
    expect(provenance).toMatchObject({
      sourceSnapshotRevision: "b06d1e3f58c3",
      assetCount: 104,
      inventorySha256: inventoryHash,
      v1CanonicalImmutable: true,
      updateGuard: "CY0004_REFERENCE_UPDATE=1",
      capture: {
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 3,
        colourModes: ["light", "dark"],
        storyFinished: "required",
        scope: "explicit per story",
      },
    });
    expect(manifest).toMatchObject({
      sourceSnapshotRevision: "b06d1e3f58c3",
      canonicalStoryCount: 52,
      interactionOnlyStoryCount: 27,
    });
    expect(manifest.stories).toHaveLength(104);
    const captureScopes = new Map(
      manifest.stories.map(
        (story: {
          storyId: string;
          colourMode: string;
          scope: "component" | "viewport";
        }) => [`${story.storyId}:${story.colourMode}`, story.scope],
      ),
    );
    expect(
      captureScopes.get("workspace-shell-components-tabs--top:light"),
    ).toBe("component");
    expect(
      captureScopes.get(
        "workspace-shell-components-declarative-settings--settings:light",
      ),
    ).toBe("viewport");
    expect(
      captureScopes.get(
        "workspace-shell-components-public-framework--tabs:light",
      ),
    ).toBe("viewport");
    expect(crosswalk).toMatchObject({
      sourceSnapshotRevision: "b06d1e3f58c3",
      sourceStoryCount: 79,
    });
    expect(crosswalk.entries).toHaveLength(79);
    expect(
      crosswalk.entries.filter(
        (entry: { coverage: string }) => entry.coverage === "new-parity-story",
      ),
    ).toHaveLength(52);
    expect(packageJson).toContain("CY0004_REFERENCE_UPDATE=1");
  });
});
