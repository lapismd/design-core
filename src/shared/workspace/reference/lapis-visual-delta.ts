export const lapisStorybookReferenceMode = "Lapis source";

export type LapisReferenceAlignment = "canvas" | "viewport";

/**
 * Adds an immutable source Workspace snapshot to an existing candidate review.
 *
 * The live story switches to the target-owned Lapis theme for this mode. The
 * candidate baseline remains first so normal Visual Delta review is unchanged.
 */
export function withLapisStorybookReference(
  candidate: string,
  sourceFile: string,
  align: LapisReferenceAlignment = "canvas",
) {
  return {
    images: [
      candidate,
      {
        src: `/lapis-reference/storybook/${sourceFile}`,
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 3,
        align,
        placement: align === "viewport" ? "center" : "right",
        mode: lapisStorybookReferenceMode,
      },
    ],
    modes: {
      [lapisStorybookReferenceMode]: {
        globals: { theme: "lapis", colorMode: "light" },
      },
    },
    opacity: 0.5,
    colorInversion: false,
    align,
    placement: align === "viewport" ? "center" : "right",
    passThresholdPercent: 0.1,
  };
}
