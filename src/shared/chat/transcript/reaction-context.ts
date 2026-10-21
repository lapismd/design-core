import type { TranscriptHost } from "./model.js";
export const reactionContext = Symbol("transcript-reactions");
export type TranscriptReactionContext = Pick<
  TranscriptHost,
  | "onReact"
  | "reactionOptions"
  | "reactionEmojis"
  | "customEmojis"
  | "reactionsDisabled"
>;
