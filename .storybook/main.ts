import type { StorybookConfig } from "@storybook/svelte-vite";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

const visualDeltaPackageRoot = fileURLToPath(
  new URL("../packages/storybook-addon-visual-delta", import.meta.url),
);

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx|svelte)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-svelte-csf",
    "@storybook/addon-vitest",
    "@storybook/addon-mcp",
    {
      name: import.meta.resolve(
        "../packages/storybook-addon-docs-mcp/src/preset.ts",
      ),
      options: {
        config: ".storybook/docs-mcp.config.ts",
      },
    },
    "@storybook/addon-themes",
    // Absolute local preset → package `src/` (not node_modules package name).
    // viteFinal lives in the addon (middleware + baseline inject + src watch).
    {
      name: import.meta.resolve("./visual-delta-preset.ts"),
      options: {
        visualDelta: {
          // Catalog layout + generator CLIs (package defaults are story-id + visual-delta bin).
          // visualServerPort defaults to Storybook port + 1 (see resolveVisualServerPort).
          baselinePathMode: "nested-import",
          visualTestArgs: ["exec", "playwright", "test"],
          visualUpdateArgs: [
            "exec",
            "tsx",
            "scripts/ui-generator/cli.ts",
            "visual-update",
            "--allow-dirty",
            "--approved",
            "--skip-build",
          ],
          visualInteractionUpdateArgs: [
            "exec",
            "tsx",
            "scripts/ui-generator/cli.ts",
            "visual-interaction-update",
            "--allow-dirty",
            "--approved",
            "--skip-build",
          ],
        },
      },
    },
  ],
  // `/visual-baselines` comes from the Visual Delta preset `staticDirs`.
  staticDirs: [
    // Upstream docs images (`/img/sidebar/…`) vendored with `pnpm ui docs:vendor`.
    {
      from: "../vendor/shadcn-svelte-docs/static",
      to: "/",
    },
  ],
  framework: {
    name: "@storybook/svelte-vite",
    options: {},
  },
  viteFinal: async (viteConfig) => {
    // Visual Delta plugins register via the addon preset's viteFinal.
    return mergeConfig(viteConfig, {
      resolve: {
        alias: {
          "@stevejuma/ui/shadcn": fileURLToPath(
            new URL("../src/shared/shadcn", import.meta.url),
          ),
          // Keep any bare imports on the workspace source tree.
          "storybook-addon-visual-delta": visualDeltaPackageRoot,
        },
      },
      optimizeDeps: {
        exclude: ["storybook-addon-visual-delta"],
      },
      server: {
        watch: {
          ignored: ["**/storybook-static/**"],
        },
      },
    });
  },
};

export default config;
