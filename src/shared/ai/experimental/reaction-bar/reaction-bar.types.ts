import type { HTMLAttributes } from "svelte/elements";
import type {
  CustomEmoji,
  EmojiOption,
  EmojiPickerProps,
} from "../../../shadcn/emoji-picker/index.js";

export type Reaction = {
  emoji: string;
  count: number;
  selected?: boolean;
  label?: string;
  /** Retain the captured registration even if it is no longer in the picker. */
  custom?: CustomEmoji;
};

export type ReactionBarProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "ontoggle"
> & {
  ref?: HTMLDivElement | null;
  reactions: readonly Reaction[];
  label?: string;
  addLabel?: string;
  disabled?: boolean;
  emojis?: readonly EmojiOption[];
  customEmojis?: readonly CustomEmoji[];
  theme?: EmojiPickerProps["theme"];
  onToggle?: (emoji: string, custom?: CustomEmoji) => void;
  onAdd?: (emoji: string, custom?: CustomEmoji) => void;
};
