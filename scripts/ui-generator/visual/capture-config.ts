/**
 * Visual capture density for Playwright baselines and Visual Delta.
 *
 * Re-exports the package constants so host scripts stay aligned with
 * `@lapismd/storybook-addon-visual-delta` (viewport 1280×900, built-in
 * deviceScaleFactor 1 — hosts may set project `deviceScaleFactor`,
 * `toHaveScreenshot({ scale: "device" })`).
 */
export {
  VISUAL_DEVICE_SCALE_FACTOR,
  VISUAL_VIEWPORT,
} from "@lapismd/storybook-addon-visual-delta/playwright";
