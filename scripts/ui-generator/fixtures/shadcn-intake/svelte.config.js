import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config | Record<string, unknown>} */
const config = {
  preprocess: vitePreprocess(),
};

export default config;
