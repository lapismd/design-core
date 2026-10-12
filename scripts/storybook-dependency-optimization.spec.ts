import { describe, expect, it } from "vitest";
import config from "../.storybook/main";
import { discoverCatalogIcons } from "../.storybook/dependency-optimization";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const browserDependencies = [
  "bits-ui",
  "@lucide/svelte/icons/info",
  "@lucide/svelte/icons/triangle-alert",
  "@lucide/svelte/icons/circle-alert",
  "@lucide/svelte/icons/x",
  "@lezer/common",
  "aria-query",
  "react",
  "react-dom",
  "react-dom/client",
  "@storybook/addon-a11y/preview",
  "@storybook/svelte-vite",
  "@storybook/addon-svelte-csf",
  "@storybook/addon-svelte-csf/internal/create-runtime-stories",
  "svelte/internal/flags/legacy",
  "storybook/test",
];

describe("cold catalog dependency optimization", () => {
  it("collects nested source and story icons once and ignores assets", () => {
    const root = mkdtempSync(path.join(tmpdir(), "catalog-icons-"));
    try {
      mkdirSync(path.join(root, "nested"));
      writeFileSync(
        path.join(root, "a.svelte"),
        'import Info from "@lucide/svelte/icons/info";',
      );
      writeFileSync(
        path.join(root, "nested", "a.stories.ts"),
        'import Info from "@lucide/svelte/icons/info"; import X from "@lucide/svelte/icons/x";',
      );
      writeFileSync(
        path.join(root, "image.svg"),
        '"@lucide/svelte/icons/never-loaded"',
      );
      expect(discoverCatalogIcons(root)).toEqual([
        "@lucide/svelte/icons/info",
        "@lucide/svelte/icons/x",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("prebundles browser runtime dependencies in the dev catalog", async () => {
    const merged = await config.viteFinal!({}, {
      configType: "DEVELOPMENT",
    } as never);
    expect(merged.plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "lapis-catalog-client-readiness",
          apply: "serve",
        }),
      ]),
    );
    expect(merged.optimizeDeps?.include).toEqual(
      expect.arrayContaining(browserDependencies),
    );
  });
});
