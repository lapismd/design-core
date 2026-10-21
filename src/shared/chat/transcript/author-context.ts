import type { TranscriptAuthorPopover } from "./model.js";
export const authorContext = Symbol("transcript-author-popovers");
export interface TranscriptAuthorContext {
  readonly popover: TranscriptAuthorPopover | undefined;
}
