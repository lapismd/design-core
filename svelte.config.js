import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/**
 * Fail Vite / Storybook transforms on any Svelte compiler warning so unused CSS
 * and similar debt cannot accumulate as console noise. `pnpm check` already
 * runs `svelte-check --fail-on-warnings`.
 *
 * @param {{ code?: string, message: string, filename?: string, start?: { line: number, column: number } }} warning
 * @param {(warning: typeof warning) => void} _defaultHandler
 */
function onwarn(warning, _defaultHandler) {
  // vite-plugin-svelte may inject a global `*` selector; ignore that noise.
  if (
    warning.code === "css_unused_selector" &&
    warning.message.includes('"*"')
  ) {
    return;
  }

  const loc = warning.filename
    ? `${warning.filename}:${warning.start?.line ?? 0}:${warning.start?.column ?? 0}`
    : "svelte";
  throw new Error(`[svelte] ${warning.code} at ${loc}: ${warning.message}`);
}

/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
const config = {
  preprocess: vitePreprocess(),
  onwarn,
  compilerOptions: {
    runes: undefined,
  },
};

export default config;
