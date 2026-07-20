import type { StorybookConfig } from "@storybook/svelte-vite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import { visualBaselineVisualDeltaPlugin } from "./visual-baseline-vite-plugin.js";
import { visualDeltaMiddlewarePlugin } from "./visual-delta-middleware.js";
import { uiDocsMiddlewarePlugin } from "./ui-docs-middleware.js";

const storybookDir = dirname(fileURLToPath(import.meta.url));
const tasksLiveChromeRoot = resolve(
  storybookDir,
  "../packages/tasks/.reference-artifacts/live-chrome",
);
// Gitignored capture tree — ensure the mount path exists before Storybook starts.
mkdirSync(tasksLiveChromeRoot, { recursive: true });

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx|svelte)",
    "../packages/workspace/src/**/*.stories.@(js|jsx|ts|tsx|svelte)",
    "../packages/tasks/src/**/*.mdx",
    "../packages/tasks/src/**/*.stories.@(js|jsx|ts|tsx|svelte)",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-svelte-csf",
    "@storybook/addon-vitest",
    "@storybook/addon-mcp",
    "storybook-addon-visual-delta",
  ],
  staticDirs: [
    {
      from: "../tests/visual/storybook.spec.ts-snapshots",
      to: "/visual-baselines",
    },
    {
      from: "../packages/tasks/reference/superlist/2026-07-20",
      to: "/tasks-reference/2026-07-20",
    },
    {
      from: "../packages/tasks/.reference-artifacts/live-chrome",
      to: "/tasks-reference-live",
    },
  ],
  framework: {
    name: "@storybook/svelte-vite",
    options: {},
  },
  viteFinal: async (viteConfig) => {
    const plugins = viteConfig.plugins ?? [];
    viteConfig.plugins = [
      visualBaselineVisualDeltaPlugin(),
      visualDeltaMiddlewarePlugin(),
      uiDocsMiddlewarePlugin(),
      ...plugins,
    ];
    return mergeConfig(viteConfig, {
      resolve: {
        alias: {
          "@stevejuma/ui/shadcn": fileURLToPath(
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
