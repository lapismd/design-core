import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type {
  MiraEditorSelection,
  MiraMarkdownActionId,
} from "@lapismd/mira/core";
import type { MiraColorMode, MiraExtension } from "@lapismd/mira/extensions";
import type { ComposerStatus } from "../../ai/types.js";
import type {
  CustomEmoji,
  EmojiOption,
} from "../../shadcn/emoji-picker/index.js";

export type MarkdownComposerHandle = {
  focus: () => void;
  getSelection: () => MiraEditorSelection | null;
  setSelection: (selection: MiraEditorSelection) => void;
  insertText: (text: string) => void;
  applyFormatting: (action: MiraMarkdownActionId) => boolean;
};

export type MarkdownComposerActions = MarkdownComposerHandle & {
  disabled: boolean;
  submit: () => void;
};

/** Host-owned reply context; the original message and delivery stay with the host. */
export type MarkdownComposerReply = {
  authorName: string;
  content: string;
};

export type MarkdownComposerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onchange" | "onsubmit"
> & {
  ref?: HTMLDivElement | null;
  handle?: MarkdownComposerHandle | null;
  value?: string;
  onChange?: (value: string) => void;
  /** Emits an exact snapshot; acknowledgement and clearing belong to the host. */
  onSubmit: (value: string) => void;
  presentation?: "framed" | "document";
  placeholder?: string;
  label?: string;
  inputLabel?: string;
  /** Optional successful form control when composed inside a host form. */
  name?: string;
  disabled?: boolean;
  busy?: boolean;
  onStop?: () => void;
  status?: ComposerStatus;
  /** Attached status edge; defaults to the original top placement. */
  statusPosition?: "top" | "bottom";
  submitLabel?: string;
  /** Omit the inline send control when a fixed TranscriptFooter owns sending. */
  showSendButton?: boolean;
  /** Omit the inline keyboard hint when the host supplies a fixed hint row. */
  showHint?: boolean;
  /** Defaults to Enter in framed mode and modifier+Enter in document mode. */
  submitOnEnter?: boolean;
  formattingOpen?: boolean;
  /** Move document-mode actions into the host footer through documentActions. */
  dockActions?: boolean;
  /** Live toolbar snippet; bind and render once in the host footer. Cleared on teardown. */
  documentActions?: Snippet | undefined;
  colorMode?: MiraColorMode;
  extensions?: readonly MiraExtension[];
  /** Neutral @, #, slash or emoji suggestions; source cancellation is host-observable. */
  triggers?: readonly import("./composer-suggestions.js").MarkdownComposerTrigger[];
  customEmojis?: readonly CustomEmoji[];
  emojis?: readonly EmojiOption[];
  /** Adapt custom emoji syntax without introducing application parsing here. */
  emojiText?: (emoji: string, custom?: CustomEmoji) => string;
  /** Shows an author and quoted message above the editor. */
  reply?: MarkdownComposerReply;
  /** Requests cancellation without changing the reply or draft internally. */
  onCancelReply?: () => void;
  /** Supplementary host content, layered behind the framed composer body. */
  drawer?: Snippet;
  /** Keep host drawer controls usable while editing and submission are blocked. */
  interactiveDrawerWhenDisabled?: boolean;
  /** Additional header context; use reply for the quoted message drawer. */
  context?: Snippet;
  /** Optional document-mode avatar; the host owns identity and presentation. */
  avatar?: Snippet;
  additionalActions?: Snippet<[MarkdownComposerActions]>;
};
