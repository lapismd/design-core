import { defineVisualPlaywrightConfig } from "storybook-addon-visual-delta/playwright";

/**
 * Catalog visual suite — same capture matrix as the packaged helper
 * (1280×900, DSF 3, updateSnapshots gated). Host suite in
 * `tests/visual/storybook.spec.ts` keeps Tasks/Fava reference logic.
 */
export default defineVisualPlaywrightConfig({
  port: 6007,
  testDir: "./tests/visual",
});
