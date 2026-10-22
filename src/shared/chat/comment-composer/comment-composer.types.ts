import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { MiraCodeEditorHandle } from "@lapismd/mira";

/** Captured presentation only; identity, revision and exact anchors belong to the host. */
export type CommentComposerSource = {
  label: string;
  quote: string;
  kind?: "code" | "markdown";
  available?: boolean;
};
export type CommentComposerHandle = Pick<
  MiraCodeEditorHandle,
  "focus" | "getSelection" | "setSelection"
>;
export type CommentComposerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onchange" | "onsubmit"
> & {
  ref?: HTMLDivElement | null;
  handle?: CommentComposerHandle | null;
  /** Bare removes the editor card chrome when an enclosing transcript owns it. */
  presentation?: "card" | "bare";
  value?: string;
  onChange?: (value: string) => void;
  /** Allows hosts to restore caret/selection across inline and queue editors. */
  onSelectionChange?: (
    selection: NonNullable<ReturnType<CommentComposerHandle["getSelection"]>>,
  ) => void;
  /** Modifier+Enter emits an exact snapshot. Acknowledgement and clearing are host-owned. */
  onSubmit?: (value: string) => void;
  source?: CommentComposerSource;
  /** Optional host renderer for application syntax, references or authorized assets. */
  sourceContent?: Snippet<[CommentComposerSource]>;
  /** Host-owned identity presentation, typically a decorative small Avatar. */
  avatar?: Snippet;
  label?: string;
  inputLabel?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  pending?: boolean;
  readOnly?: boolean;
  references?: import("../inline-reference/inline-reference.types.js").ChatReferenceOptions;
  triggers?: readonly import("../markdown-composer/composer-suggestions.js").MarkdownComposerTrigger[];
  editorExtensions?: import("@codemirror/state").Extension;
  /** Escape requests dismissal without deleting the draft. */
  onDismiss?: () => void;
  onRemove?: () => void;
  /** The opener supports host-owned source navigation and focus restoration. */
  onNavigateSource?: (opener: HTMLButtonElement) => void;
};
