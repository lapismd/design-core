import { defineVisualPlaywrightConfig } from "@lapismd/storybook-addon-visual-delta/playwright";

/**
 * Catalog visual suite — packaged Visual Delta Playwright defaults
 * (1280×900, project `deviceScaleFactor`, updateSnapshots gated).
 * Suite: `tests/visual/storybook.spec.ts` → `defineVisualSuite`.
 *
 * Static port defaults to `STORYBOOK_PORT + 1` (or `VISUAL_SERVER_PORT`).
 * With `pnpm storybook` on :9009 that is :9010.
 *
 * Always reuse an existing static server: the Docker CI image sets `CI=true`,
 * which would otherwise refuse the warm server started by `visual-delta update`.
 */
const config = defineVisualPlaywrightConfig({
  testDir: "./tests/visual",
});

export default {
  ...config,
  webServer: config.webServer
    ? {
        ...config.webServer,
        reuseExistingServer: true,
      }
    : config.webServer,
};
