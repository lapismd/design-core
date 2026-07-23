/**
 * Visual Delta helpers for Fava screen baselines.
 * Paths must match scripts/beancount-screens/capture-matrix.json outputPath values.
 */

export type FavaVisualDeltaParams = {
  images: string[];
  opacity: number;
  colorInversion: boolean;
  align: "canvas";
  placement: "right";
  passThresholdPercent: number;
};

/** URL under Storybook `/visual-baselines` for a matrix capture id. */
export function favaBaselineUrl(id: string): string {
  return `/visual-baselines/apps/beancount/screens/${id}-chromium-darwin.png`;
}

export function visualDeltaForScreen(id: string): FavaVisualDeltaParams {
  return {
    images: [favaBaselineUrl(id)],
    opacity: 0.5,
    colorInversion: false,
    align: "canvas",
    placement: "right",
    passThresholdPercent: 0.1,
  };
}

/** @deprecated Prefer visualDeltaForScreen(id); kept for story-id call sites. */
export function visualDeltaForStory(storyId: string): FavaVisualDeltaParams {
  const id = storyId.split("--")[1];
  if (!id) throw new Error(`Unexpected story id: ${storyId}`);
  return visualDeltaForScreen(id);
}
