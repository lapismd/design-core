import { defineConfig, devices } from "@playwright/test";
import {
  VISUAL_DEVICE_SCALE_FACTOR,
  VISUAL_VIEWPORT,
} from "./scripts/ui-generator/visual/capture-config.js";

const port = 6007;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  // Ordinary visual runs must never create or overwrite baselines.
  // Use `pnpm test:visual:update --component <name>` (guarded) instead.
  // Create-only path sets PLAYWRIGHT_UPDATE_MODE=missing (new PNGs only).
  updateSnapshots:
    process.env.PLAYWRIGHT_UPDATE_SNAPSHOTS === "1"
      ? process.env.PLAYWRIGHT_UPDATE_MODE === "missing"
        ? "missing"
        : "all"
      : "none",
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.01,
      // Pack device pixels (see deviceScaleFactor). Default "css" would
      // discard the extra density and keep 1× PNG sizes.
      scale: "device",
    },
  },
  use: {
    baseURL,
    locale: "en-GB",
    timezoneId: "Europe/London",
    colorScheme: "light",
    reducedMotion: "reduce",
    viewport: { ...VISUAL_VIEWPORT },
    deviceScaleFactor: VISUAL_DEVICE_SCALE_FACTOR,
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Desktop Chrome defaults to DSF 1 and 1280×720 — keep our viewport
        // and hi-DPI factor after the device preset.
        viewport: { ...VISUAL_VIEWPORT },
        deviceScaleFactor: VISUAL_DEVICE_SCALE_FACTOR,
      },
    },
  ],
  webServer: {
    command: `python3 -m http.server ${port} --directory storybook-static --bind 127.0.0.1`,
    url: `${baseURL}/index.json`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
