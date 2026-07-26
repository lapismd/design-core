export const lapisStorybookReferenceMode = "Lapis source";
export const cy0004LightReferenceMode = "CY-0004 light";
export const cy0004DarkReferenceMode = "CY-0004 dark";

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

/**
 * Reviews a live target parity fixture against both corrected CY-0004 modes.
 *
 * v1 remains available for provenance. These v2 images are compare-only and
 * may be replaced only through the guarded source capture command.
 */
export function withCy0004ParityReference(
  candidate: string,
  sourceFile: string,
  align: LapisReferenceAlignment = "viewport",
) {
  const image = (mode: "light" | "dark", label: string) => ({
    src: `/lapis-reference/storybook-v2/${mode}/${sourceFile}`,
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 3,
    align,
    placement: align === "viewport" ? "center" : "right",
    mode: label,
  });
  return {
    images: [
      candidate,
      image("light", cy0004LightReferenceMode),
      image("dark", cy0004DarkReferenceMode),
    ],
    modes: {
      [cy0004LightReferenceMode]: {
        globals: { theme: "lapis", colorMode: "light" },
      },
      [cy0004DarkReferenceMode]: {
        globals: { theme: "lapis", colorMode: "dark" },
      },
    },
    opacity: 0.5,
    colorInversion: false,
    align,
    placement: align === "viewport" ? "center" : "right",
    passThresholdPercent: 0,
  };
}
