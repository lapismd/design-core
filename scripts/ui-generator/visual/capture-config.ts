/**
 * Visual capture density for Playwright baselines and Visual Delta.
 *
 * CSS layout stays at the configured viewport (1280×900). Screenshots use
 * `deviceScaleFactor` with `toHaveScreenshot({ scale: "device" })` so PNGs
 * pack more pixels (width/height × this factor).
 *
 * Convention: Playwright defaults to `scale: "css"` (1px per CSS px) for
 * small, stable CI baselines. We opt into `scale: "device"` for sharper
 * component-clipped baselines used in Visual Delta overlays.
 *
 * Keep `VISUAL_DEVICE_SCALE_FACTOR` in sync with
 * `packages/storybook-addon-visual-delta/src/constants.ts`.
 */
export const VISUAL_DEVICE_SCALE_FACTOR = 3;

export const VISUAL_VIEWPORT = { width: 1280, height: 900 } as const;
