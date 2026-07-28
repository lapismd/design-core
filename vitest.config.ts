import { defineConfig, mergeConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import viteConfig from "./vite.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  viteConfig,
  defineConfig({
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
          test: {
            name: "visual-delta",
            environment: "jsdom",
            include: [
              "packages/storybook-addon-visual-delta/src/**/*.{spec,test}.{ts,tsx}",
            ],
            setupFiles: [
              "./packages/storybook-addon-visual-delta/src/test/setup.ts",
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
