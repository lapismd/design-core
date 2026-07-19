<script lang="ts" module>
  import { foldEffect, foldable, unfoldAll } from "@codemirror/language";
  import { EditorSelection } from "@codemirror/state";
  import type { EditorView as CodeMirrorEditorView } from "@codemirror/view";

  import {
    createMarkdownEdit,
    type MarkdownFormatKind,
  } from "./markdown-format";

  export type YamlReviewDiff = {
    id: string;
    title: string;
    before: string;
    after: string;
    paths: string[];
    status: "pending" | "accepted" | "rejected";
    stale?: boolean;
  };

  export type YamlEditorFoldAction = "fold" | "unfold";
  export type YamlEditorFoldRequest = {
    id: number;
    action: YamlEditorFoldAction;
    target?: string;
  };

  let activeEditor: CodeMirrorEditorView | null = null;

  export function formatActiveYamlSelection(
    kind: MarkdownFormatKind,
    linkUrl = "url",
  ) {
    const editor = activeEditor;
    if (!editor || !editor.hasFocus) return false;

    let offset = 0;
    const changes = editor.state.selection.ranges.map((range) => {
      const selectedText = editor.state.doc.sliceString(range.from, range.to);
      const edit = createMarkdownEdit(kind, selectedText, linkUrl);
      const mappedFrom = range.from + offset;
      offset += edit.text.length - (range.to - range.from);
      return {
        range,
        edit,
        selectionFrom: mappedFrom + edit.selectionStart,
        selectionTo: mappedFrom + edit.selectionEnd,
      };
    });

    editor.dispatch({
      changes: changes.map(({ range, edit }) => ({
        from: range.from,
        to: range.to,
        insert: edit.text,
      })),
      selection: EditorSelection.create(
        changes.map(({ selectionFrom, selectionTo }) =>
          EditorSelection.range(selectionFrom, selectionTo),
        ),
        editor.state.selection.mainIndex,
      ),
      scrollIntoView: true,
      userEvent: "input",
    });
    editor.focus();
    return true;
  }
</script>

<script lang="ts">
  import { yaml } from "@codemirror/lang-yaml";
  import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
  import { Compartment, type Range } from "@codemirror/state";
  import { Decoration, EditorView, WidgetType } from "@codemirror/view";
  import { tags } from "@lezer/highlight";
  import { basicSetup } from "codemirror";
  import { onMount } from "svelte";

  import { unifiedDiff, type UnifiedDiffLine } from "./review-diff";

  let {
    value = $bindable(""),
    invalid = false,
    frameless = false,
    minHeight = "16rem",
    ariaLabel = "YAML editor",
    editorId = "yaml-editor",
    foldRequest = null,
    reviewDiffs = [],
    onUndoReview,
    onKeepReview,
    onChange,
  }: {
    value?: string;
    invalid?: boolean;
    frameless?: boolean;
    minHeight?: string;
    ariaLabel?: string;
    editorId?: string;
    foldRequest?: YamlEditorFoldRequest | null;
    reviewDiffs?: YamlReviewDiff[];
    onUndoReview?: (id: string) => void;
    onKeepReview?: (id: string) => void;
    onChange?: (value: string) => void;
  } = $props();

  let host: HTMLDivElement;
  let editor: EditorView | null = null;
  let lastFoldRequestId: number | null = null;
  const themeCompartment = new Compartment();
  const diffCompartment = new Compartment();
  const ariaLabelCompartment = new Compartment();

  /** Fill the parent and scroll inside CodeMirror (docs YAML pane). */
  const fillParent = $derived(
    minHeight === "100%" || minHeight === "100vh" || minHeight === "100dvh",
  );

  class ReviewHunkWidget extends WidgetType {
    removedLines: UnifiedDiffLine[];
    addedLines: UnifiedDiffLine[];
    diff: YamlReviewDiff;
    onUndo?: (id: string) => void;
    onKeep?: (id: string) => void;

    constructor(
      diff: YamlReviewDiff,
      removedLines: UnifiedDiffLine[],
      addedLines: UnifiedDiffLine[],
      onUndo?: (id: string) => void,
      onKeep?: (id: string) => void,
    ) {
      super();
      this.diff = diff;
      this.removedLines = removedLines;
      this.addedLines = addedLines;
      this.onUndo = onUndo;
      this.onKeep = onKeep;
    }

    eq(other: ReviewHunkWidget) {
      return (
        this.diff.id === other.diff.id &&
        this.diff.title === other.diff.title &&
        this.diff.stale === other.diff.stale &&
        JSON.stringify(this.removedLines) ===
          JSON.stringify(other.removedLines) &&
        JSON.stringify(this.addedLines) === JSON.stringify(other.addedLines)
      );
    }

    toDOM() {
      const wrapper = document.createElement("div");
      wrapper.className = "cm-ai-review-block";
      const header = document.createElement("div");
      header.className = "cm-ai-review-header";
      const title = document.createElement("span");
      title.className = "cm-ai-review-title";
      title.textContent = this.diff.title || "AI change";
      header.append(title);
      wrapper.append(header);

      for (const line of this.removedLines) wrapper.append(reviewLineRow(line));
      for (const line of this.addedLines) wrapper.append(reviewLineRow(line));

      const actions = document.createElement("div");
      actions.className = "cm-ai-review-actions";
      const undo = document.createElement("button");
      undo.type = "button";
      undo.className = "cm-ai-review-button cm-ai-review-button-destructive";
      undo.textContent = "Undo";
      undo.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.onUndo?.(this.diff.id);
      });
      actions.append(undo);

      if (!this.diff.stale) {
        const keep = document.createElement("button");
        keep.type = "button";
        keep.className = "cm-ai-review-button cm-ai-review-button-primary";
        keep.textContent = "Keep";
        keep.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.onKeep?.(this.diff.id);
        });
        actions.append(keep);
      }

      wrapper.append(actions);
      return wrapper;
    }

    ignoreEvent() {
      return false;
    }
  }

  function reviewLineRow(line: UnifiedDiffLine) {
    const row = document.createElement("div");
    row.className =
      line.type === "removed" ? "cm-ai-deleted-line" : "cm-ai-inserted-line";
    row.append(document.createTextNode(line.type === "removed" ? "- " : "+ "));
    for (const segment of line.segments) {
      if (segment.type === "equal") {
        row.append(document.createTextNode(segment.text));
        continue;
      }
      const element = document.createElement(
        segment.type === "removed" ? "del" : "ins",
      );
      element.className =
        segment.type === "removed" ? "cm-ai-diff-removed" : "cm-ai-diff-added";
      element.textContent = segment.text;
      row.append(element);
    }
    return row;
  }

  function diffDecorations(view: EditorView, diffs: YamlReviewDiff[]) {
    const ranges: Range<Decoration>[] = [];
    for (const diff of diffs) {
      if (diff.before === diff.after) continue;
      const parts = unifiedDiff(diff.before, diff.after);
      let afterLine = 1;
      for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
        const part = parts[partIndex];
        if (part.type === "equal") {
          afterLine += part.lines.length;
          continue;
        }

        const hunkStartLine = afterLine;
        const removedLines: UnifiedDiffLine[] = [];
        const addedLines: UnifiedDiffLine[] = [];
        while (partIndex < parts.length && parts[partIndex].type !== "equal") {
          const hunkPart = parts[partIndex];
          for (const line of hunkPart.lines) {
            if (line.type === "removed") {
              removedLines.push(line);
              continue;
            }
            addedLines.push(line);
            const lineNumber = afterLine;
            if (lineNumber <= view.state.doc.lines) {
              ranges.push(
                Decoration.line({ class: "cm-ai-added-line" }).range(
                  view.state.doc.line(lineNumber).from,
                ),
              );
            }
            afterLine += 1;
          }
          partIndex += 1;
        }
        partIndex -= 1;
        const position =
          hunkStartLine > view.state.doc.lines
            ? view.state.doc.length
            : view.state.doc.line(Math.max(hunkStartLine, 1)).from;
        ranges.push(
          Decoration.widget({
            widget: new ReviewHunkWidget(
              diff,
              removedLines,
              addedLines,
              onUndoReview,
              onKeepReview,
            ),
            block: true,
            side: -1,
          }).range(position),
        );
      }
    }
    return ranges;
  }

  function diffExtension(view: EditorView, diffs: YamlReviewDiff[]) {
    const ranges = diffDecorations(view, diffs);
    if (!ranges.length) return [];
    return [
      EditorView.decorations.of(Decoration.set(ranges, true)),
      EditorView.baseTheme({
        ".cm-ai-added-line": {
          backgroundColor: "color-mix(in oklab, #16a34a 14%, transparent)",
        },
        ".cm-ai-review-block": {
          backgroundColor:
            "var(--cv-form-background, var(--kanban-card, var(--background)))",
          borderTop:
            "1px solid var(--cv-form-border, var(--kanban-border, var(--border)))",
          borderBottom:
            "1px solid var(--cv-form-border, var(--kanban-border, var(--border)))",
          fontFamily:
            "var(--studio-font-mono, var(--font-mono, 'Source Code Pro Variable', 'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace))",
          fontSize: "13px",
          lineHeight: "1.55",
          overflowX: "auto",
          padding: "2px 0 2px 52px",
          whiteSpace: "pre",
        },
        ".cm-ai-review-header": {
          alignItems: "center",
          display: "flex",
          gap: "8px",
          justifyContent: "flex-start",
          padding: "2px 10px 4px 0",
          whiteSpace: "normal",
        },
        ".cm-ai-review-title": {
          color:
            "var(--cv-form-foreground, var(--kanban-foreground, var(--foreground)))",
          fontFamily: "var(--font-sans)",
          fontSize: "12px",
          fontWeight: "600",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
        ".cm-ai-review-actions": {
          display: "flex",
          gap: "4px",
          justifyContent: "flex-start",
          padding: "4px 10px 6px 0",
        },
        ".cm-ai-review-button": {
          backgroundColor: "transparent",
          border: "0",
          borderRadius: "4px",
          color:
            "var(--cv-form-foreground, var(--kanban-foreground, var(--foreground)))",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontSize: "12px",
          height: "24px",
          padding: "0 8px",
        },
        ".cm-ai-review-button:hover": {
          backgroundColor: "var(--cv-form-muted-surface, var(--muted))",
        },
        ".cm-ai-review-button-destructive": {
          color: "var(--destructive, rgb(220 38 38))",
        },
        ".cm-ai-review-button-primary": {
          backgroundColor: "color-mix(in oklab, #16a34a 18%, transparent)",
          color: "color-mix(in oklab, #16a34a 78%, var(--foreground))",
        },
        ".cm-ai-deleted-line": {
          backgroundColor:
            "color-mix(in oklab, var(--destructive, rgb(220 38 38)) 12%, transparent)",
          color: "var(--destructive, rgb(220 38 38))",
        },
        ".cm-ai-diff-removed": {
          color: "var(--destructive, rgb(220 38 38))",
          fontWeight: "600",
        },
        ".cm-ai-inserted-line": {
          backgroundColor: "color-mix(in oklab, #16a34a 12%, transparent)",
          color: "color-mix(in oklab, #16a34a 82%, var(--foreground))",
        },
        ".cm-ai-diff-added": {
          color: "color-mix(in oklab, #16a34a 88%, var(--foreground))",
          fontWeight: "600",
          textDecoration: "none",
        },
      }),
    ];
  }

  function foldAllNested(view: EditorView) {
    const effects = [];
    const seen = new Set<string>();
    for (
      let lineNumber = 1;
      lineNumber <= view.state.doc.lines;
      lineNumber += 1
    ) {
      const line = view.state.doc.line(lineNumber);
      const range = foldable(view.state, line.from, line.to);
      if (!range) continue;
      const key = `${range.from}:${range.to}`;
      if (seen.has(key)) continue;
      seen.add(key);
      effects.push(foldEffect.of(range));
    }
    if (!effects.length) return false;
    view.dispatch({ effects });
    return true;
  }

  function editorTheme() {
    return [
      EditorView.theme({
        "&": {
          ...(fillParent
            ? { height: "100%", minHeight: 0 }
            : { minHeight, height: "auto" }),
          color:
            "var(--cv-form-foreground, var(--kanban-foreground, var(--foreground)))",
          backgroundColor: "transparent",
        },
        "&.cm-focused": {
          outline: "0",
        },
        ".cm-scroller": {
          ...(fillParent
            ? { height: "100%", minHeight: 0, overflow: "auto" }
            : { minHeight }),
          fontFamily:
            "var(--studio-font-mono, var(--font-mono, 'Source Code Pro Variable', 'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace))",
          backgroundColor: "transparent",
        },
        ".cm-content": {
          ...(fillParent ? {} : { minHeight }),
          fontSize: "0.82rem",
          lineHeight: "1.55",
          padding: "0.75rem",
        },
        ".cm-gutters": {
          color:
            "var(--cv-form-muted, var(--kanban-muted, var(--muted-foreground)))",
          backgroundColor:
            "var(--cv-form-gutter, color-mix(in srgb, var(--kanban-muted-surface, var(--muted)) 34%, transparent))",
          borderRightColor:
            "var(--cv-form-border, var(--kanban-border, var(--border)))",
        },
        ".cm-activeLine, .cm-activeLineGutter": {
          backgroundColor:
            "var(--cv-form-active-line, color-mix(in srgb, var(--card-color, var(--primary)) 9%, transparent))",
        },
        ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
          backgroundColor:
            "var(--cv-form-selection-strong, color-mix(in srgb, var(--card-color, var(--primary)) 30%, transparent))",
        },
        ".cm-cursor": {
          borderLeftColor:
            "var(--cv-form-foreground, var(--kanban-foreground, var(--foreground)))",
        },
        ".cm-tooltip": {
          borderRadius: "calc(var(--radius, 0.625rem) - 0.125rem)",
          borderColor:
            "var(--cv-form-border, var(--kanban-border, var(--border)))",
          backgroundColor:
            "var(--cv-form-popover, var(--kanban-card, var(--popover)))",
          color:
            "var(--cv-form-foreground, var(--kanban-foreground, var(--popover-foreground)))",
          boxShadow:
            "0 12px 24px color-mix(in srgb, var(--foreground) 16%, transparent)",
          fontFamily:
            "var(--studio-font-mono, var(--font-mono, 'Source Code Pro Variable', 'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace))",
          fontSize: "0.75rem",
          lineHeight: "1.45",
          overflow: "hidden",
        },
        ".cm-tooltip *": {
          fontFamily:
            "var(--studio-font-mono, var(--font-mono, 'Source Code Pro Variable', 'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace))",
        },
        ".cm-tooltip-autocomplete > ul": {
          backgroundColor: "transparent",
          color:
            "var(--cv-form-foreground, var(--kanban-foreground, var(--popover-foreground)))",
          fontSize: "0.75rem",
          lineHeight: "1.4",
        },
        ".cm-tooltip-autocomplete > ul > li": {
          padding: "0.25rem 0.45rem",
        },
        ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
          backgroundColor:
            "var(--cv-form-active-line, var(--kanban-muted-surface, var(--accent)))",
          color:
            "var(--cv-form-foreground, var(--kanban-foreground, var(--accent-foreground)))",
        },
        ".cm-completionDetail": {
          color:
            "var(--cv-form-muted, var(--kanban-muted, var(--muted-foreground)))",
        },
        ".cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionDetail":
          {
            color: "inherit",
          },
        ".cm-completionMatchedText": {
          color: "var(--cv-form-accent, var(--card-color, var(--primary)))",
          fontWeight: "700",
        },
        ".cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionMatchedText":
          {
            color: "inherit",
          },
      }),
      syntaxHighlighting(
        HighlightStyle.define([
          {
            tag: tags.keyword,
            color: "var(--cv-form-accent, var(--card-color, var(--primary)))",
          },
          {
            tag: tags.atom,
            color: "var(--cv-form-accent, var(--card-color, var(--primary)))",
          },
          {
            tag: tags.bool,
            color: "var(--cv-form-accent, var(--card-color, var(--primary)))",
          },
          {
            tag: tags.number,
            color: "var(--cv-form-accent, var(--card-color, var(--primary)))",
          },
          {
            tag: tags.string,
            color:
              "var(--cv-form-foreground, var(--kanban-foreground, var(--foreground)))",
          },
          {
            tag: tags.propertyName,
            color: "var(--cv-form-accent, var(--card-color, var(--primary)))",
          },
          {
            tag: tags.comment,
            color:
              "var(--cv-form-muted, var(--kanban-muted, var(--muted-foreground)))",
          },
          {
            tag: tags.punctuation,
            color:
              "var(--cv-form-muted, var(--kanban-muted, var(--muted-foreground)))",
          },
        ]),
      ),
    ];
  }

  onMount(() => {
    editor = new EditorView({
      doc: value,
      parent: host,
      extensions: [
        basicSetup,
        yaml(),
        EditorView.lineWrapping,
        EditorView.domEventHandlers({
          focus: (_event, view) => {
            activeEditor = view;
          },
          blur: (_event, view) => {
            setTimeout(() => {
              if (activeEditor === view && !view.hasFocus) activeEditor = null;
            });
          },
        }),
        diffCompartment.of([]),
        themeCompartment.of(editorTheme()),
        ariaLabelCompartment.of(
          EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
        ),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          value = update.state.doc.toString();
          onChange?.(value);
        }),
      ],
    });
    editor.dom
      .querySelector(".cm-gutters")
      ?.setAttribute("aria-hidden", "true");

    return () => editor?.destroy();
  });

  $effect(() => {
    if (!editor) return;
    const current = editor.state.doc.toString();
    if (value !== current) {
      editor.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  });

  $effect(() => {
    if (!editor) return;
    editor.dispatch({
      effects: themeCompartment.reconfigure(editorTheme()),
    });
  });

  $effect(() => {
    if (!editor) return;
    editor.dispatch({
      effects: ariaLabelCompartment.reconfigure(
        EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
      ),
    });
  });

  $effect(() => {
    if (!editor) return;
    editor.dispatch({
      effects: diffCompartment.reconfigure(diffExtension(editor, reviewDiffs)),
    });
  });

  $effect(() => {
    if (!editor || !foldRequest) return;
    if (foldRequest.target && foldRequest.target !== editorId) return;
    if (foldRequest.id === lastFoldRequestId) return;
    lastFoldRequestId = foldRequest.id;
    if (foldRequest.action === "fold") {
      foldAllNested(editor);
      return;
    }
    unfoldAll(editor);
  });
</script>

<div
  bind:this={host}
  class:error={invalid}
  class:frameless
  class:fill={fillParent}
  class="cvstudio-yaml-editor"
  aria-label={ariaLabel}
></div>

<style>
  .cvstudio-yaml-editor {
    overflow: hidden;
    border: 1px solid var(--cv-form-border, var(--kanban-border, var(--border)));
    border-radius: 0.35rem;
    background: transparent;
  }

  .cvstudio-yaml-editor.frameless {
    border: 0;
    border-radius: 0;
  }

  /* Size comes from a flex parent (e.g. docs YAML pane); keep min-height: 0 so
     the CodeMirror scroller can shrink and scroll instead of growing forever. */
  .cvstudio-yaml-editor.fill {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
    align-self: stretch;
  }

  .cvstudio-yaml-editor.fill :global(.cm-editor) {
    flex: 1 1 auto;
    min-height: 0;
  }

  .cvstudio-yaml-editor.error {
    border-color: var(--destructive, rgb(220 38 38));
  }

  :global(.cvstudio-yaml-editor:not(.fill) .cm-editor) {
    height: auto;
  }

  :global(.cvstudio-yaml-editor.fill .cm-editor) {
    height: 100%;
    min-height: 0;
  }
</style>
