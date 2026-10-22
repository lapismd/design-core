import type { Component } from "svelte";
import type { MiraExtension } from "@lapismd/mira/extensions";
import InlineReference from "./InlineReference.svelte";
import {
  chatReferenceRanges,
  serializeChatReference,
} from "./reference-ranges.js";
import { protectChatReferences } from "./reference-remark.js";
import { renderChatReferences } from "./reference-preview.js";
import { referenceEditor } from "./reference-widget.js";
import type {
  ChatReference,
  ChatReferenceOptions,
  ChatReferenceSource,
  ChatReferenceTrigger,
} from "./inline-reference.types.js";

/** One extension for source-preserving editor widgets and safe Markdown preview chips. */
export function createChatReferenceExtension(
  options: ChatReferenceOptions,
): MiraExtension {
  const Preview: Component<{ referenceSource: string }> = (anchor, props) => {
    InlineReference(anchor, {
      get reference() {
        const source = props.referenceSource;
        return (
          chatReferenceRanges(source, options).find(
            (match) => match.from === 0 && match.to === source.length,
          )?.reference ??
          options.resolve(source) ?? {
            id: source,
            kind: "unknown",
            label: source,
          }
        );
      },
      onActivate: options.onActivate,
      get popover() {
        const source = props.referenceSource;
        const reference =
          options.resolve(source) ??
          chatReferenceRanges(source, options).find(
            (match) => match.from === 0 && match.to === source.length,
          )?.reference;
        return reference ? options.getPopover?.(reference) : undefined;
      },
    });
    return {};
  };
  return {
    name: "chat-inline-references",
    codeMirror: () => referenceEditor(options),
    components: { sharedchatreference: Preview },
    remarkPlugins: [
      () => (tree: Parameters<typeof protectChatReferences>[0]) =>
        protectChatReferences(tree, options),
    ],
    rehypePlugins: [
      () => (tree: Parameters<typeof renderChatReferences>[0]) =>
        renderChatReferences(tree, options),
    ],
  };
}
/** Suggestions serialize only; recipient policy belongs to the host. */
export function chatReferenceTriggers(
  sources: readonly ChatReferenceSource[],
  options: ChatReferenceOptions,
): ChatReferenceTrigger[] {
  return sources.map((source) => {
    let found = new Map<string, ChatReference>();
    return {
      character: source.character,
      menuLabel: source.label,
      searchSource: async (query, signal) => {
        const results = await source.search(query, signal);
        if (signal.aborted) return [];
        found = new Map(results.map((reference) => [reference.id, reference]));
        return results.map((reference) => ({
          id: reference.id,
          label: reference.label,
          description: reference.description,
          avatar: reference.avatar,
          icon: reference.icon,
        }));
      },
      onSelect: (item) => {
        const reference = found.get(item.id);
        return reference
          ? `${serializeChatReference(reference, options)} `
          : "";
      },
    };
  });
}
