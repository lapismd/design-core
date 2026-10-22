import { EditorState, Prec, StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView, keymap } from "@codemirror/view";
import {
  capturedCodeLanguage,
  fileCodeLanguage,
  numberedCodeHighlights,
} from "./captured-code.js";
import { emojiDecorations } from "./emoji-decorations.js";
import { readingDecorations } from "./markdown-decorations.js";
import { commentDecorations } from "./comment-widgets.js";
import { middleDecorations } from "./middle-fold.js";
import { patchLines } from "./patch-lines.js";
import { chatCaret } from "./chat-caret.js";
import { numberedCodeGutter } from "./numbered-code-gutter.js";
import type { TranscriptBlock, TranscriptProps } from "./model.js";
import type { TranscriptController } from "./comments.svelte.js";
import type { ReaderSource } from "./reader-source.js";

export const refreshComments = StateEffect.define<null>();
export function readingExtensions(
  block: TranscriptBlock,
  comments: TranscriptController,
  contexts: Map<unknown, unknown>,
  fileView = false,
  source?: ReaderSource,
  markdown?: TranscriptProps["markdown"],
  presentation?: Pick<TranscriptProps, "inlineReferences" | "readerExtensions">,
) {
  const references =
    block.kind === "markdown"
      ? ((
          presentation?.inlineReferences ?? comments.props().inlineReferences
        )?.(block) ?? [])
      : [];
  const reading =
    block.kind === "markdown"
      ? readingDecorations(block.text, references, {
          fileLink: (destination) =>
            !!comments.props().resolveFileLink?.(block, destination),
          paths: comments.props().displayPaths?.(block),
          markdown: markdown ?? comments.props().markdown,
          contexts,
          source: { block: { ...block }, comments },
        })
      : undefined;
  const referenceDecorations = Decoration.set(
    [
      ...references.map((r) => r.decoration),
      ...emojiDecorations(block.text, block.emojis),
    ],
    true,
  );
  const open = (view: EditorView, initial = "") => {
    const selection = view.state.selection.main;
    const offset = source?.from ?? 0;
    // Code caret comments use the existing line anchor behavior on the slice.
    const line = view.state.doc.lineAt(selection.from);
    const from = selection.empty && source ? line.from : selection.from;
    const to = selection.empty && source ? line.to : selection.to;
    comments.open(
      source?.block ?? block,
      { from: from + offset, to: to + offset },
      initial,
    );
    return true;
  };
  const annotations = StateField.define({
    create: () => commentDecorations(block, comments, contexts, source),
    update: (value, tr) =>
      tr.effects.some((e) => e.is(refreshComments))
        ? commentDecorations(block, comments, contexts, source)
        : value,
    provide: (field) => EditorView.decorations.from(field),
  });
  let composing = false;
  const folds = StateField.define({
    create: () => middleDecorations(block, comments, source),
    update: (value, tr) =>
      tr.effects.some((e) => e.is(refreshComments))
        ? middleDecorations(block, comments, source)
        : value,
    provide: (field) => [
      EditorView.decorations.from(field),
      EditorView.atomicRanges.of((view) => view.state.field(field)),
    ],
  });
  return [
    chatCaret,
    (presentation?.readerExtensions ?? comments.props().readerExtensions)?.(
      block,
    ) ?? [],
    EditorView.updateListener.of((update) => {
      if (source && update.selectionSet && update.view.hasFocus) {
        const selection = update.state.selection.main;
        comments.sourceSelections.set(source.block.id, {
          from: source.from + selection.from,
          to: source.from + selection.to,
        });
      }
    }),
    // Input is routed into comments; the retained document rejects every edit.
    Prec.highest(EditorView.editable.of(true)),
    EditorState.transactionFilter.of((tr) => (tr.docChanged ? [] : tr)),
    EditorView.contentAttributes.of({
      "aria-readonly": "true",
      "data-chat-reader": block.id,
    }),
    block.kind === "markdown"
      ? [
          EditorView.editorAttributes.of({
            class: "markdown-preview-surface markdown-live-preview-mode",
            style:
              "--mira-preview-padding: 0; --file-margins-x: 0px; --file-margins-y: 0px; --file-line-width: 100%;",
          }),
          EditorView.decorations.of(reading!.decorations),
          EditorView.decorations.of(referenceDecorations),
          EditorView.atomicRanges.of(() => referenceDecorations),
          EditorView.atomicRanges.of(() => reading!.hidden),
        ]
      : block.lineNumbered
        ? EditorView.decorations.of(
            Decoration.set(
              numberedCodeHighlights(block.text, block.path).map(
                ({ from, to, classes }) =>
                  Decoration.mark({ class: classes }).range(from, to),
              ),
              true,
            ),
          )
        : fileView
          ? fileCodeLanguage(block.path)
          : capturedCodeLanguage(block.path),
    block.kind === "patch" ? patchDecorations(block.text) : [],
    block.lineNumbered ? numberedCodeGutter(block.text) : [],
    annotations,
    folds,
    Prec.highest(
      keymap.of([
        { key: "Ctrl-Alt-m", run: (view) => open(view) },
        { key: "Meta-Alt-m", run: (view) => open(view) },
      ]),
    ),
    EditorView.domEventHandlers({
      keydown(event, view) {
        const element = event.target instanceof Element ? event.target : null;
        if (
          element?.closest("[data-chat-comment-area], [data-chat-fold-control]")
        )
          return false;
        const link = element?.closest<HTMLElement>(
          "[data-chat-link], [data-chat-file-link]",
        );
        if (link && event.key === "Enter") {
          if (link.dataset.chatFileLink)
            comments
              .props()
              .resolveFileLink?.(block, link.dataset.chatFileLink)?.();
          else
            window.open(link.dataset.chatLink, "_blank", "noopener,noreferrer");
          return true;
        }
        if (
          !composing &&
          !event.isComposing &&
          event.keyCode !== 229 &&
          !event.ctrlKey &&
          !event.metaKey &&
          event.key.length === 1 &&
          event.key !== "Dead" &&
          !link
        ) {
          event.preventDefault();
          return open(view, event.key);
        }
        return false;
      },
      paste(event, view) {
        if ((event.target as Element)?.closest?.("[data-chat-comment-area]"))
          return false;
        const text = event.clipboardData?.getData("text/plain");
        event.preventDefault();
        if (text) open(view, text);
        return true;
      },
      compositionstart() {
        composing = true;
        return false;
      },
      compositionend(event, view) {
        composing = false;
        if (event.data) open(view, event.data);
        return true;
      },
      click(event) {
        if (
          !(event.target as Element)?.closest?.(
            ".ui-transcript-markdown-preview",
          )
        )
          comments.sourceSelections.delete(block.id);
        const link = (event.target as Element)?.closest?.<HTMLElement>(
          "[data-chat-link], [data-chat-file-link]",
        );
        if (link) {
          if (link.dataset.chatFileLink)
            comments
              .props()
              .resolveFileLink?.(block, link.dataset.chatFileLink)?.();
          else
            window.open(link.dataset.chatLink, "_blank", "noopener,noreferrer");
          return true;
        }
        return false;
      },
      drop(event) {
        event.preventDefault();
        return true;
      },
    }),
    EditorView.inputHandler.of((view, _from, _to, text) => {
      if (text && !composing) open(view, text);
      return true;
    }),
  ];
}
function patchDecorations(text: string) {
  const ranges = patchLines(text).map(({ from, kind }) =>
    Decoration.line({
      attributes: {
        class: `ui-transcript-patch-${kind}`,
        "data-patch-kind": kind,
      },
    }).range(from),
  );
  return EditorView.decorations.of(Decoration.set(ranges, true));
}
