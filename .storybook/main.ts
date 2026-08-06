import type { StorybookConfig } from "@storybook/svelte-vite";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

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
    {
      name: "@lapismd/storybook-addon-visual-delta",
      options: {
        visualDelta: {
          // Catalog layout + generator CLIs (package defaults are story-id + visual-delta bin).
          // visualServerPort defaults to Storybook port + 1 (see resolveVisualServerPort).
          baselinePathMode: "nested-import",
          allowVcsWrites: true,
          visualTestArgs: ["exec", "playwright", "test"],
          affectedTests: {
            externals: ["vendor/shadcn-svelte-docs/static/**"],
          },
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
          "@lapismd/design-core/shadcn": fileURLToPath(
            new URL("../src/shared/shadcn", import.meta.url),
          ),
        },
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
