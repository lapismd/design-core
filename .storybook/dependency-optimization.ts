import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Prebundle exact icon imports, including those introduced by new catalog stories. */
export function discoverCatalogIcons(root: string): string[] {
  const icons = new Set<string>();
  const scan = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) scan(file);
      else if (entry.isFile() && /\.(svelte|tsx?|mdx)$/.test(entry.name)) {
        const source = readFileSync(file, "utf8");
        for (const match of source.matchAll(
          /["'](@lucide\/svelte(?:\/icons\/[a-z0-9-]+)?)["']/g,
        )) {
          icons.add(match[1]);
        }
      }
    }
  };
  scan(root);
  return [...icons].sort();
}

/** Shared by the dev catalog and Vitest so cold previews do not re-optimize mid-play. */
export const storybookBrowserDependencies = [
  "@codemirror/autocomplete",
  "@codemirror/commands",
  "@codemirror/lang-java",
  "@codemirror/lang-javascript",
  "@codemirror/lang-json",
  "@codemirror/lang-markdown",
  "@codemirror/lang-python",
  "@codemirror/lang-xml",
  "@codemirror/lang-yaml",
  "@codemirror/language",
  "@codemirror/legacy-modes/mode/clike",
  "@codemirror/legacy-modes/mode/javascript",
  "@codemirror/legacy-modes/mode/python",
  "@codemirror/legacy-modes/mode/rust",
  "@codemirror/legacy-modes/mode/shell",
  "@codemirror/legacy-modes/mode/swift",
  "@codemirror/legacy-modes/mode/toml",
  "@codemirror/lint",
  "@codemirror/state",
  "@codemirror/view",
  "@iconify-json/lucide",
  "@iconify/utils",
  "@internationalized/date",
  "@lapismd/mira/codemirror",
  "@lapismd/mira/core",
  "@lapismd/mira/extensions",
  "@lapismd/mira/tables",
  "@lapismd/storybook-addon-visual-delta/visual-capture",
  "@lezer/highlight",
  "@lezer/lr",
  "@tanstack/svelte-virtual",
  "chrono-node",
  "codemirror-lang-mermaid",
  "luxon",
  "minimatch",
  "paneforge",
  "tailwind-merge",
  "vaul-svelte",
  "yaml",
  "bits-ui",
  "emoji-mart",
  "@lapismd/mira/preview",
  "@lapismd/mira",
  ...discoverCatalogIcons(fileURLToPath(new URL("../src", import.meta.url))),
  "@lezer/common",
  "@lezer/markdown",
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
