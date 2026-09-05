import { defineConfig, mergeConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import viteConfig from "./vite.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Keep browser-runner dependencies stable across a cold suite. Axe annotations
// enforce preview accessibility errors; the editor parser avoids a mid-run Vite reload.
const storybookBrowserDependencies = [
  "@lezer/common",
  "aria-query",
  "react",
  "react-dom",
  "react-dom/client",
  "@storybook/addon-a11y/preview",
  "@storybook/svelte-vite",
];

export default mergeConfig(
  viteConfig,
  defineConfig({
    optimizeDeps: {
      include: storybookBrowserDependencies,
    },
    ssr: {
      noExternal: ["aria-query"],
    },
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            environment: "node",
            include: [
              "src/**/*.spec.ts",
              "scripts/storybook-*.spec.ts",
              "scripts/ui-generator/**/*.spec.ts",
            ],
          },
        },
        {
          extends: true,
          resolve: {
            dedupe: ["react", "react-dom"],
          },
          plugins: [
            storybookTest({
              configDir: path.join(dirname, ".storybook"),
            }),
          ],
          optimizeDeps: {
            include: storybookBrowserDependencies,
          },
          ssr: {
            noExternal: ["aria-query"],
          },
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              provider: playwright({}),
              headless: true,
              instances: [{ browser: "chromium" }],
            },
            setupFiles: ["./.storybook/vitest.setup.ts"],
          },
        },
      ],
    },
  }),
);
