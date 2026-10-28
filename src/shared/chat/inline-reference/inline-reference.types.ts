import type { Component, Snippet } from "svelte";
import type { AvatarIdentity } from "../../shadcn/avatar/index.js";
import type { MarkdownComposerTrigger } from "../markdown-composer/composer-suggestions.js";
/** Display identity only. Hosts own lookup, permissions, navigation and addressing. */
export type ChatReference = {
  id: string;
  kind: string;
  label: string;
  href?: string;
  description?: string;
  icon?: Component;
  avatar?: AvatarIdentity;
  presentation?: "chip" | "emoji";
  appearance?: "reference" | "mention";
};
export type ChatReferenceMatch = {
  from: number;
  to: number;
  reference: ChatReference;
};
export type ChatReferenceOptions = {
  /** Resolve only destinations registered by the host. Unknown destinations stay ordinary links. */
  resolve(destination: string): ChatReference | undefined;
  /** Exact UTF-16 ranges for legacy tokens, custom emoji or other host syntax. */
  matches?(text: string): readonly ChatReferenceMatch[];
  /** Requests host navigation. This callback never sends or dispatches a message. */
  onActivate?(reference: ChatReference): void;
  /** Optional profile/context popover. Omit for references without a preview. */
  getPopover?(reference: ChatReference): Snippet<[ChatReference]> | undefined;
  /** Optional serialization override, for example an existing application's stored token. */
  serialize?(reference: ChatReference): string;
};
export type ChatReferenceSource = {
  character: string;
  label: string;
  search(
    query: string,
    signal: AbortSignal,
  ): readonly ChatReference[] | Promise<readonly ChatReference[]>;
};
export type ChatReferenceTrigger = MarkdownComposerTrigger;
