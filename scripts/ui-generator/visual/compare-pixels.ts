/**
 * Host compatibility re-export. The addon owns the pixel comparison contract
 * so Playwright, the panel, and generator pipelines cannot drift.
 */
export * from "../../../packages/storybook-addon-visual-delta/src/playwright/compare-pixels.js";
