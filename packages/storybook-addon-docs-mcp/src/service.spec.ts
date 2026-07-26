import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createDocsService } from "./service.js";
import type { DocsMcpConfig } from "./types.js";

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("Docs service normalization and cache", () => {
  it("keeps legacy providers source-compatible and invalidates normalized metadata by source content", () => {
    const root = mkdtempSync(path.join(tmpdir(), "docs-mcp-service-"));
    roots.push(root);
    const source = path.join(root, "Button.md");
    writeFileSync(source, "First summary");
    const config: DocsMcpConfig = {
      cacheDir: ".cache",
      provider: {
        name: "legacy-provider",
        sourceFiles: () => [source],
        load: () => ({
          project: { title: "Legacy UI" },
          components: [
            {
              id: "button",
              group: "controls",
              slug: "button",
              name: "Button",
              summary: readFileSync(source, "utf8"),
              path: "Button.svelte",
              markdown: "# Button\n\nA button.\n\n## Usage\n\n`<Button />`\n",
              sourceFiles: [source],
            },
          ],
          documents: [],
        }),
      },
    };
    const service = createDocsService({ root, config });
    expect(service.getCatalog().components[0]).toMatchObject({
      summary: "First summary",
      sections: [{ id: "usage", title: "Usage" }],
    });
    writeFileSync(source, "Updated summary");
    expect(service.getCatalog().components[0]!.summary).toBe("Updated summary");
  });

  it("publishes retrieval metadata and curated artifacts in manifests", () => {
    const config: DocsMcpConfig = {
      provider: {
        name: "artifact-provider",
        sourceFiles: () => [],
        load: () => ({
          project: { title: "Artifact UI" },
          components: [],
          documents: [],
          artifacts: [
            {
              id: "block-toolbar",
              kind: "block",
              group: "blocks",
              slug: "toolbar",
              name: "Toolbar",
              summary: "A composed toolbar.",
              path: "Toolbar.stories.svelte",
              source: "Toolbar story",
              componentIds: ["search"],
              keywords: ["list filtering"],
              relatedIds: ["search"],
              documentation:
                "# Toolbar\n\nA toolbar.\n\n## Usage\n\nCompose it.\n",
              sourceFiles: [],
            },
          ],
        }),
      },
    };
    const service = createDocsService({
      root: process.cwd(),
      config,
      noCache: true,
    });
    expect(service.buildArtifactsManifest()).toMatchObject({
      artifacts: {
        "block-toolbar": {
          kind: "block",
          keywords: ["list filtering"],
          relatedIds: ["search"],
          sections: [{ id: "usage", title: "Usage" }],
        },
      },
    });
    expect(service.buildLlmsIndex()).toContain("## Blocks");
    expect(service.resolveLlmsPath("/llms/blocks/toolbar.txt")).toMatchObject({
      status: 200,
      body: expect.stringContaining("# Toolbar"),
    });
  });
});
