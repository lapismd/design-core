import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const storybookTest = fileURLToPath(
  new URL("./node_modules/storybook/dist/test/index.js", import.meta.url),
);

const visualDeltaPackageRoot = fileURLToPath(
  new URL("../storybook-addon-visual-delta", import.meta.url),
);

export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  resolve: {
    alias: [
      { find: "storybook/test", replacement: storybookTest },
      // Sibling link: package `./node` export points at dist; prefer source for Vite/tsx.
      {
        find: /^storybook-addon-visual-delta\/node$/,
        replacement: path.join(visualDeltaPackageRoot, "src/node/index.ts"),
      },
      {
        find: /^storybook-addon-visual-delta\/(.*)/,
        replacement: path.join(visualDeltaPackageRoot, "$1"),
      },
    ],
  },
});
