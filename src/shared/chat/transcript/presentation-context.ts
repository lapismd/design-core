import type { TranscriptProps } from "./model.js";
export const presentationContext = Symbol("transcript-presentation");
export type TranscriptPresentationContext = Pick<
  TranscriptProps,
  "markdown" | "unavailableStatus" | "unavailableStatusPosition"
>;
