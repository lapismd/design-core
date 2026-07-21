import type { StorybookConfig } from "@storybook/svelte-vite";
import type { Plugin } from "vite";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import { visualBaselineVisualDeltaPlugin } from "./visual-baseline-vite-plugin.js";
import { visualDeltaMiddlewarePlugin } from "./visual-delta-middleware.js";
import { uiDocsMiddlewarePlugin } from "./ui-docs-middleware.js";

const visualDeltaPackageRoot = fileURLToPath(
  new URL("../packages/storybook-addon-visual-delta", import.meta.url),
);
const visualDeltaSrc = fileURLToPath(
  new URL("../packages/storybook-addon-visual-delta/src", import.meta.url),
);

/**
 * Watch the workspace addon source (outside node_modules) so preview HMR
 * picks up overlay/decorator edits. Manager/panel edits still need a full
 * Storybook restart — the manager builder is a one-shot esbuild compile.
 */
function watchVisualDeltaSourcePlugin(): Plugin {
  return {
    name: "watch-visual-delta-source",
    configureServer(server) {
      server.watcher.add(visualDeltaSrc);
      server.watcher.on("change", (file) => {
        if (!file.startsWith(visualDeltaSrc)) return;
        // Preview decorators/overlay can reload in the iframe.
        // Manager React panel is not on this Vite graph.
        server.ws.send({ type: "full-reload", path: "*" });
      });
    },
  };
}

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
    // Absolute local preset → package `src/` (not node_modules package name).
    import.meta.resolve("./visual-delta-preset.ts"),
    "storybook-addon-tag-badges",
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
      watchVisualDeltaSourcePlugin(),
      ...plugins,
    ];
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
          // Vite ignores node_modules by default; keep watching storybook-static
          // out, and rely on the explicit watcher.add(visualDeltaSrc) above for
          // the workspace addon package.
          ignored: ["**/storybook-static/**"],
        },
      },
    });
  },
};

export default config;
