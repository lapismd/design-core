<script lang="ts" module>
  import "./YamlEditor.css";
  import { unfoldAll } from "@codemirror/language";
  import type { EditorView as CodeMirrorEditorView } from "@codemirror/view";
  import type { MiraCodeEditorHandle } from "@lapismd/mira";

  import type { MarkdownFormatKind } from "../core/markdown-format";
  import { formatYamlSelection } from "./yaml-editor-runtime";

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

  type MiraEditorView = NonNullable<
    ReturnType<MiraCodeEditorHandle["getView"]>
  >;

  let activeEditor: MiraEditorView | null = null;

  export function formatActiveYamlSelection(
    kind: MarkdownFormatKind,
    linkUrl = "url",
  ) {
    const editor = activeEditor;
    if (!editor || !editor.hasFocus) return false;

    formatYamlSelection(
      editor as unknown as CodeMirrorEditorView,
      kind,
      linkUrl,
    );
    editor.focus();
    return true;
  }
</script>

<script lang="ts">
  import { yaml } from "@codemirror/lang-yaml";
  import { Compartment, type Extension, type Range } from "@codemirror/state";
  import { Decoration, EditorView, WidgetType } from "@codemirror/view";
  import { MiraCodeEditor } from "@lapismd/mira";

  import { unifiedDiff, type UnifiedDiffLine } from "../core/review-diff";
  import { foldAllYaml } from "./yaml-editor-runtime";

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

  let editor: MiraCodeEditorHandle | null = $state(null);
  let lastFoldRequestId: number | null = null;
  const diffCompartment = new Compartment();
  const yamlExtensions: Extension = [yaml(), diffCompartment.of([])];

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
          backgroundColor: "var(--ui-form-background)",
          borderTop: "1px solid var(--ui-form-border)",
          borderBottom: "1px solid var(--ui-form-border)",
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
          color: "var(--ui-form-foreground)",
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
          color: "var(--ui-form-foreground)",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontSize: "12px",
          height: "24px",
          padding: "0 8px",
        },
        ".cm-ai-review-button:hover": {
          backgroundColor: "var(--ui-form-muted-surface)",
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

  function asHostEditorView(view: MiraEditorView): EditorView {
    // Runtime hosts deduplicate CodeMirror. This narrow cast keeps linked
    // peer patch versions from leaking nominal private fields into the form.
    return view as unknown as EditorView;
  }

  function handleFocus(_event: FocusEvent, view: MiraEditorView): void {
    activeEditor = view;
  }

  function handleBlur(_event: FocusEvent, view: MiraEditorView): void {
    setTimeout(() => {
      if (activeEditor === view && !view.hasFocus) activeEditor = null;
    });
  }

  $effect(() => {
    const view = editor?.getView();
    if (!view) return;
    view.dispatch({
      effects: diffCompartment.reconfigure(
        diffExtension(asHostEditorView(view), reviewDiffs),
      ),
    });
  });

  $effect(() => {
    const view = editor?.getView();
    if (!view || !foldRequest) return;
    if (foldRequest.target && foldRequest.target !== editorId) return;
    if (foldRequest.id === lastFoldRequestId) return;
    lastFoldRequestId = foldRequest.id;
    if (foldRequest.action === "fold") {
      foldAllYaml(asHostEditorView(view));
      return;
    }
    unfoldAll(asHostEditorView(view));
  });
</script>

<div
  class:error={invalid}
  class:frameless
  class:fill={fillParent}
  class="cvstudio-yaml-editor"
  data-ui-component="yaml-editor"
  data-ui-part="yaml-editor"
>
  <MiraCodeEditor
    bind:this={editor}
    bind:value
    extensions={yamlExtensions}
    {invalid}
    {minHeight}
    {ariaLabel}
    scrollerTabIndex={0}
    variant="code"
    surface={frameless ? "frameless" : "framed"}
    height={fillParent ? "fill" : "content"}
    onFocus={handleFocus}
    onBlur={handleBlur}
    onChange={(nextValue) => onChange?.(nextValue)}
  />
</div>
