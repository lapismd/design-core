import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

describe("Lapis theme contract", () => {
  it("maps the source palette and shell geometry onto target tokens", async () => {
    const css = await readFile(
      path.join(repoRoot, "src/themes/lapis.css"),
      "utf8",
    );

    expect(css).toContain('[data-ui-theme="lapis"]');
    expect(css).toContain("--background: #ffffff");
    expect(css).toContain("--background: #1e1e1e");
    expect(css).toContain("--ui-workspace-tab-height: 40px");
    expect(css).toContain("--ui-workspace-tab-width: 200px");
    expect(css).toContain("--ui-workspace-ribbon-width: 49px");
    expect(css).toContain("--ui-workspace-sidebar-header-height: 32px");
  });

  it("is exported and selectable in Storybook", async () => {
    const [manifest, preview, styles] = await Promise.all([
      readFile(path.join(repoRoot, "package.json"), "utf8"),
      readFile(path.join(repoRoot, ".storybook/preview.ts"), "utf8"),
      readFile(path.join(repoRoot, "src/styles.css"), "utf8"),
    ]);

    expect(manifest).toContain(
      '"./themes/lapis.css": "./src/themes/lapis.css"',
    );
    expect(preview).toContain('{ value: "lapis", title: "Lapis" }');
    expect(preview).toContain('lapis: "lapis"');
    expect(styles.indexOf("./themes/lapis.css")).toBeGreaterThan(
      styles.indexOf("./shared/workspace/workspace.tokens.css"),
    );
  });
});
