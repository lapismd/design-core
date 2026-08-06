/**
 * Experimental ASTRYX Lab-derived chat affordances.
 *
 * @experimental These exports can change independently of the stable chat API.
 */
export { default as Reasoning } from "./reasoning/Reasoning.svelte";
/** @experimental */
export { default as ReactionBar } from "./reaction-bar/ReactionBar.svelte";
/** @experimental */
export { default as EmojiPicker } from "./emoji-picker/EmojiPicker.svelte";
/** @experimental */
export { default as TypingIndicator } from "./typing-indicator/TypingIndicator.svelte";
/** @experimental */
export { default as UnreadDivider } from "./unread-divider/UnreadDivider.svelte";

/** @experimental */
export {
  DEFAULT_EMOJIS,
  type EmojiOption,
} from "./emoji-picker/EmojiPicker.svelte";
/** @experimental */
export type { Reaction } from "./reaction-bar/ReactionBar.svelte";
