// Adapted from jj-store composer-chip-widgets.ts; mount the shared renderer in every reader.
import { mount, unmount } from "svelte";
import {
  Decoration,
  ViewPlugin,
  WidgetType,
  type EditorView,
  type DecorationSet,
} from "@codemirror/view";
import InlineReference from "./InlineReference.svelte";
import { chatReferenceRanges } from "./reference-ranges.js";
import type {
  ChatReference,
  ChatReferenceOptions,
} from "./inline-reference.types.js";
export class ChatReferenceWidget extends WidgetType {
  #mounted = new WeakMap<HTMLElement, ReturnType<typeof mount>>();
  constructor(
    readonly reference: ChatReference,
    readonly options: ChatReferenceOptions,
    readonly range?: { from: number; to: number; source: string },
  ) {
    super();
  }
  eq(other: ChatReferenceWidget) {
    return (
      this.reference === other.reference &&
      this.options === other.options &&
      this.range?.from === other.range?.from &&
      this.range?.to === other.range?.to &&
      this.range?.source === other.range?.source
    );
  }
  toDOM(view: EditorView) {
    const node = document.createElement("span");
    node.contentEditable = "false";
    node.dataset.chatReference = this.reference.id;
    this.#mounted.set(
      node,
      mount(InlineReference, {
        target: node,
        props: {
          reference: this.reference,
          onActivate: this.options.onActivate,
          popover: this.options.getPopover?.(this.reference),
          onRemove: this.range
            ? () => {
                const { from, to, source } = this.range!;
                const text = view.state.doc.toString();
                // A late event must not remove a different source revision.
                if (view.state.readOnly || text.slice(from, to) !== source)
                  return;
                view.dispatch({
                  changes: { from, to: text[to] === " " ? to + 1 : to },
                  selection: { anchor: from },
                });
                view.focus();
              }
            : undefined,
        },
      }),
    );
    return node;
  }
  destroy(node: HTMLElement) {
    const mounted = this.#mounted.get(node);
    if (mounted) void unmount(mounted);
    this.#mounted.delete(node);
  }
}
export function chatReferenceDecorations(
  text: string,
  options: ChatReferenceOptions,
  editable = false,
) {
  return chatReferenceRanges(text, options).map((match) => ({
    ...match,
    decoration: Decoration.replace({
      widget: new ChatReferenceWidget(
        match.reference,
        options,
        editable
          ? {
              from: match.from,
              to: match.to,
              source: text.slice(match.from, match.to),
            }
          : undefined,
      ),
    }).range(match.from, match.to),
  }));
}
export function referenceEditor(options: ChatReferenceOptions) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = this.build(view);
      }
      update(update: import("@codemirror/view").ViewUpdate) {
        if (update.docChanged || update.selectionSet || update.viewportChanged)
          this.decorations = this.build(update.view);
      }
      build(view: EditorView) {
        return Decoration.set(
          chatReferenceDecorations(
            view.state.doc.toString(),
            options,
            !view.state.readOnly,
          )
            .filter(
              (match) =>
                !view.state.selection.ranges.some((range) =>
                  range.empty
                    ? range.head > match.from && range.head < match.to
                    : range.from < match.to && range.to > match.from,
                ),
            )
            .map((match) => match.decoration),
          true,
        );
      }
    },
    { decorations: (value) => value.decorations },
  );
}
