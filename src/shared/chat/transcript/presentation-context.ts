import type { TranscriptProps } from "./model.js";
export const presentationContext = Symbol("transcript-presentation");
type PresentationOptions = Pick<
  TranscriptProps,
  | "markdown"
  | "unavailableStatus"
  | "unavailableStatusPosition"
  | "getMessageActions"
  | "actionTooltips"
  | "inlineReferences"
  | "readerExtensions"
  | "commentComposer"
>;
/** Reactive context getters remain present while an optional host value clears. */
export type TranscriptPresentationContext = {
  [Key in keyof PresentationOptions]: PresentationOptions[Key] | undefined;
};
