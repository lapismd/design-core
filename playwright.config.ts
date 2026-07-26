import { defineVisualPlaywrightConfig } from "storybook-addon-visual-delta/playwright";

/**
 * Catalog visual suite — same capture matrix as the packaged helper
 * (1280×900, DSF 3, updateSnapshots gated). Host suite in
 * `tests/visual/storybook.spec.ts` owns this catalog's sidecar reporting.
 *
 * Static port defaults to `STORYBOOK_PORT + 1` (or `VISUAL_SERVER_PORT`).
 * With `pnpm storybook` on :9009 that is :9010.
 */
export default defineVisualPlaywrightConfig({
  testDir: "./tests/visual",
});
