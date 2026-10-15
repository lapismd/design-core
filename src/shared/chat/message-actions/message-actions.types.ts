import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type {
  CustomEmoji,
  EmojiOption,
  EmojiPickerProps,
} from "../../shadcn/emoji-picker/index.js";

export type MessageAction = {
  id: string;
  label: string;
  icon?: Snippet;
  primary?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  /** Also disables the action; remains readable beside disabled menu items. */
  disabledReason?: string;
  destructive?: boolean;
  onSelect: () => void;
};

export type MessageActionsProps = HTMLAttributes<HTMLDivElement> & {
  ref?: HTMLDivElement | null;
  actions: readonly MessageAction[];
  children?: Snippet;
  label?: string;
  moreLabel?: string;
  disabled?: boolean;
  alwaysVisible?: boolean;
  /** Floating around supplied message content; inline when used alone. */
  presentation?: "floating" | "inline";
  customEmojis?: readonly CustomEmoji[];
  emojis?: readonly EmojiOption[];
  theme?: EmojiPickerProps["theme"];
  onAddReaction?: (emoji: string, custom?: CustomEmoji) => void;
};
