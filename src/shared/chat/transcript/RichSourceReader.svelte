<script lang="ts">
  import { getContext, onMount, tick, untrack } from "svelte";
  import { MiraCodeEditor, type MiraCodeEditorHandle } from "@lapismd/mira";
  import { EditorState, Prec } from "@codemirror/state";
  import { EditorView, keymap } from "@codemirror/view";
  import { fileCodeLanguage } from "./captured-code.js";
  import { readingDecorations } from "./markdown-decorations.js";
  import { richSourceContext, type RichSourceContext } from "./rich-source.js";
  let {
    from,
    to,
    language,
    label,
  }: {
    from: number;
    to: number;
    language?: string;
    label: string;
  } = $props();
  const context = getContext<RichSourceContext>(richSourceContext);
  const { block, comments } = context;
  const text = untrack(() => block.text.slice(from, to));
  let editor: MiraCodeEditorHandle;
  const remember = (view: EditorView) => {
    const selected = view.state.selection.main;
    comments.sourceSelections.set(block.id, {
      from: from + selected.from,
      to: from + selected.to,
    });
  };
  const open = (view: EditorView, initial = "") => {
    remember(view);
    comments.open(block, comments.sourceSelections.get(block.id)!, initial);
    return true;
  };
  const decorations = untrack(() =>
    !language ? readingDecorations(text) : undefined,
  );
  const extensions = untrack(() => [
    Prec.highest(EditorView.editable.of(true)),
    EditorState.transactionFilter.of((tr) => (tr.docChanged ? [] : tr)),
    EditorView.contentAttributes.of({ "aria-readonly": "true" }),
    EditorView.editorAttributes.of({
      style:
        "--mira-preview-padding: 0; --file-margins-x: 0px; --file-margins-y: 0px; --file-margins: 0px; --file-line-width: 100%;",
    }),
    ...(language
      ? [
          fileCodeLanguage(
            `source.${language === "typescript" ? "ts" : language === "javascript" ? "js" : language === "markdown" ? "md" : language}`,
          ),
        ]
      : [
          EditorView.decorations.of(decorations!.decorations),
          EditorView.atomicRanges.of(() => decorations!.hidden),
        ]),
    EditorView.updateListener.of((update) => {
      if (update.selectionSet && update.view.hasFocus) remember(update.view);
    }),
    keymap.of([
      { key: "Ctrl-Alt-m", run: (view) => open(view) },
      { key: "Meta-Alt-m", run: (view) => open(view) },
    ]),
    EditorView.domEventHandlers({
      focus(_event, view) {
        remember(view);
        return false;
      },
      keydown(event, view) {
        if (
          !event.isComposing &&
          event.keyCode !== 229 &&
          !event.ctrlKey &&
          !event.metaKey &&
          event.key.length === 1 &&
          event.key !== "Dead"
        ) {
          event.preventDefault();
          return open(view, event.key);
        }
        return false;
      },
      paste(event, view) {
        event.preventDefault();
        const value = event.clipboardData?.getData("text/plain");
        if (value) open(view, value);
        return true;
      },
      compositionend(event, view) {
        if (event.data) open(view, event.data);
        return true;
      },
      drop(event) {
        event.preventDefault();
        return true;
      },
    }),
  ]);
  onMount(() => {
    let disposed = false;
    const reader = {
      from,
      to,
      revision: block.revision,
      reveal: (start: number, end: number, scroll: boolean) => {
        editor.getView()?.dispatch({
          selection: { anchor: start - from, head: end - from },
          scrollIntoView: scroll,
        });
        editor.focus();
      },
    };
    const readers = comments.embeddedReaders.get(block.id) ?? new Set();
    readers.add(reader);
    comments.embeddedReaders.set(block.id, readers);
    void tick().then(() => {
      if (!disposed) editor.getView()?.requestMeasure();
    });
    return () => {
      disposed = true;
      readers.delete(reader);
      if (!readers.size) comments.embeddedReaders.delete(block.id);
    };
  });
</script>

<div
  class="ui-transcript-rich-reader"
  data-code={!!language}
  data-chat-reader-range={`${from}:${to}`}
>
  <MiraCodeEditor
    bind:this={editor}
    value={text}
    {extensions}
    readonly
    lineNumbers={false}
    ariaLabel={label}
    variant={language ? "code" : "document"}
    surface="frameless"
    height="content"
    minHeight="0"
  />
</div>
