import { defineVisualPlaywrightConfig } from "@lapismd/storybook-addon-visual-delta/playwright";

/**
 * Catalog visual suite — packaged Visual Delta Playwright defaults
 * (1280×900, project `deviceScaleFactor`, updateSnapshots gated).
 * Suite: `tests/visual/storybook.spec.ts` → `defineVisualSuite`.
 *
 * Static port defaults to `STORYBOOK_PORT + 1` (or `VISUAL_SERVER_PORT`).
 * With `pnpm storybook` on :9009 that is :9010.
 */
export default defineVisualPlaywrightConfig({
  testDir: "./tests/visual",
});
