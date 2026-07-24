/**
 * Visual capture density for Playwright baselines and Visual Delta.
 *
 * Re-exports the package constants so host scripts stay aligned with
 * `storybook-addon-visual-delta` (viewport 1280×900, deviceScaleFactor 3,
 * `toHaveScreenshot({ scale: "device" })`).
 */
export {
  VISUAL_DEVICE_SCALE_FACTOR,
  VISUAL_VIEWPORT,
} from "storybook-addon-visual-delta/playwright";
