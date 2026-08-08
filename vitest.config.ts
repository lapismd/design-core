import { defineConfig, mergeConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import viteConfig from "./vite.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Keep axe annotations available to the browser runner so preview
// `parameters.a11y.test: "error"` fails `pnpm test:storybook` on violations.
const storybookA11yDependencies = [
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
      include: storybookA11yDependencies,
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
              "packages/storybook-addon-docs-mcp/src/**/*.spec.ts",
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
            include: storybookA11yDependencies,
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
