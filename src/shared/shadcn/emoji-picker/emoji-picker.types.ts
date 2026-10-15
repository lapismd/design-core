import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type EmojiOption = { emoji: string; name: string };

/** Identity and asset delivery belong to the host. */
export type CustomEmoji = {
  id: string;
  shortcode: string;
  url: string;
  label?: string;
};

export type EmojiPickerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onselect"
> & {
  ref?: HTMLDivElement | null;
  open?: boolean;
  /** Inline mounts the same full/restricted panel without a trigger or another popover. */
  presentation?: "popover" | "inline";
  /** When supplied, restrict selection to this searchable list, including []. */
  emojis?: readonly EmojiOption[];
  presets?: readonly string[];
  /** Display suggested reactions alone, without loading the full library. */
  presetsOnly?: boolean;
  customEmojis?: readonly CustomEmoji[];
  disabled?: boolean;
  selection?: string;
  label?: string;
  searchLabel?: string;
  triggerLabel?: string;
  trigger?: Snippet;
  /** Pass the resolved application theme when it differs from the OS. */
  theme?: "light" | "dark" | "auto";
  onSelect: (emoji: string, custom?: CustomEmoji) => void;
};

/** Suggested choices retained for existing restricted-list consumers. */
export const DEFAULT_EMOJIS: readonly EmojiOption[] = [
  { emoji: "👍", name: "thumbs up" },
  { emoji: "❤️", name: "heart" },
  { emoji: "😂", name: "joy" },
  { emoji: "🎉", name: "tada" },
  { emoji: "😮", name: "wow" },
  { emoji: "😢", name: "cry" },
  { emoji: "🔥", name: "fire" },
  { emoji: "👀", name: "eyes" },
  { emoji: "✅", name: "check" },
  { emoji: "🙏", name: "pray" },
  { emoji: "💯", name: "hundred" },
  { emoji: "🚀", name: "rocket" },
  { emoji: "😍", name: "heart eyes" },
  { emoji: "🤔", name: "thinking" },
  { emoji: "👋", name: "wave" },
  { emoji: "⭐", name: "star" },
];
