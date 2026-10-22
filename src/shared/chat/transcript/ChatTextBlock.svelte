<script lang="ts">
  import { getAllContexts, getContext, onMount, tick, untrack } from "svelte";
  import { MiraCodeEditor, type MiraCodeEditorHandle } from "@lapismd/mira";
  import { Compartment } from "@codemirror/state";
  import ChatHoverActions from "./ChatHoverActions.svelte";
  import { FileTypeIcon } from "../../shadcn/file-type-icon/index.js";
  import type { EditorView } from "@codemirror/view";
  import { readingExtensions, refreshComments } from "./text-editor.js";
  import type { TranscriptBlock, TranscriptProps } from "./model.js";
  import type { TranscriptController } from "./comments.svelte.js";
  import { validAnchor } from "./anchors.js";
  import { middleFoldKey } from "./middle-fold.js";
  import { registerReader } from "./reader-registry.js";
  import { replyIndicator } from "./reply-indicator.js";
  import type { ReaderSource } from "./reader-source.js";
  import {
    presentationContext,
    type TranscriptPresentationContext,
  } from "./presentation-context.js";
  import "./text-reader.css";
  let {
    block,
    state: comments,
    showHeader = true,
    reactionTarget,
    messageActions,
    reply = false,
    fileView = false,
    initialLine,
    source,
    showActions = true,
  }: {
    block: TranscriptBlock;
    state: TranscriptController;
    showHeader?: boolean;
    reactionTarget?: string | undefined;
    messageActions?: TranscriptProps["messageActions"];
    reply?: boolean;
    fileView?: boolean;
    initialLine?: number;
    source?: ReaderSource;
    showActions?: boolean;
  } = $props();
  let editor: MiraCodeEditorHandle;
  let view = $state<EditorView>();
  const contexts = getAllContexts();
  const presentation = getContext<TranscriptPresentationContext | undefined>(
    presentationContext,
  );
  const markdown = $derived(
    presentation?.markdown ?? comments.props().markdown,
  );
  const replyPrefix = new Compartment();
  const reader = new Compartment();
  let configured = "";
  let configuredReferences: TranscriptProps["inlineReferences"];
  let configuredReader: TranscriptProps["readerExtensions"];
  const extensions = untrack(() => [
    reader.of(
      readingExtensions(
        block,
        comments,
        contexts,
        fileView,
        source,
        markdown,
        presentation,
      ),
    ),
    replyPrefix.of(reply ? replyIndicator : []),
  ]);
  onMount(() => {
    let disposed = false;
    const id = block.id;
    let release = () => {};
    const reveal: NonNullable<ReturnType<typeof comments.readers.get>> = (
      anchor,
      scroll = false,
    ) => {
      const embedded = [...(comments.embeddedReaders.get(id) ?? [])].find(
        (reader) =>
          reader.revision === block.revision &&
          anchor.from >= reader.from &&
          anchor.to <= reader.to,
      );
      if (validAnchor(block, anchor) && embedded) {
        embedded.reveal(anchor.from, anchor.to, scroll);
        return;
      }
      if (validAnchor(block, anchor))
        view?.dispatch({
          selection: { anchor: anchor.from, head: anchor.to },
          scrollIntoView: scroll,
        });
      editor.focus();
    };
    void tick().then(() => {
      if (disposed) return;
      view = editor.getView() ?? undefined;
      if (source) {
        const original = source;
        const embedded = {
          from: original.from,
          to: original.to,
          revision: original.block.revision,
          reveal: (from: number, to: number, scroll: boolean) => {
            view?.dispatch({
              selection: {
                anchor: from - original.from,
                head: to - original.from,
              },
              scrollIntoView: scroll,
            });
            editor.focus();
          },
        };
        const readers =
          comments.embeddedReaders.get(original.block.id) ?? new Set();
        readers.add(embedded);
        comments.embeddedReaders.set(original.block.id, readers);
        release = () => {
          readers.delete(embedded);
          if (!readers.size) comments.embeddedReaders.delete(original.block.id);
        };
      } else release = registerReader(comments.readers, id, reveal);
    });
    return () => {
      disposed = true;
      release();
      view = undefined;
    };
  });
  $effect(() => {
    const signature = JSON.stringify([
      block.id,
      block.revision,
      block.text,
      block.path,
      block.kind,
      block.lineNumbered,
      block.wholeSection,
      block.commentable,
      block.emojis,
      fileView,
    ]);
    const references =
      presentation?.inlineReferences ?? comments.props().inlineReferences;
    const readerExtensions =
      presentation?.readerExtensions ?? comments.props().readerExtensions;
    if (
      view &&
      (signature !== configured ||
        references !== configuredReferences ||
        readerExtensions !== configuredReader)
    ) {
      if (signature !== configured) comments.sourceSelections.delete(block.id);
      configuredReferences = references;
      configuredReader = readerExtensions;
      configured = signature;
      const previous = view.state.doc.toString(),
        next = block.text;
      let from = 0,
        end = previous.length,
        nextEnd = next.length;
      while (from < end && from < nextEnd && previous[from] === next[from])
        from++;
      while (
        end > from &&
        nextEnd > from &&
        previous[end - 1] === next[nextEnd - 1]
      ) {
        end--;
        nextEnd--;
      }
      // Only host-owned immutable capture updates bypass the edit-rejection filter.
      // A minimal replacement preserves cursor positions and existing widgets.
      view.dispatch({
        ...(previous === next
          ? {}
          : { changes: { from, to: end, insert: next.slice(from, nextEnd) } }),
        effects: reader.reconfigure(
          readingExtensions(
            untrack(() => block),
            comments,
            contexts,
            fileView,
            source,
            markdown,
            presentation,
          ),
        ),
        filter: false,
      });
    }
  });
  $effect(() => {
    view?.dispatch({
      effects: replyPrefix.reconfigure(reply ? replyIndicator : []),
    });
  });
  $effect(() => {
    comments.active;
    comments.visibleThreads;
    comments.highlightedThread;
    comments.disclosures[middleFoldKey(block)];
    view?.dispatch({ effects: refreshComments.of(null) });
  });
  function comment() {
    const selection = source
      ? (comments.sourceSelections.get(source.block.id) ?? {
          from: source.from + (view?.state.selection.main.from ?? 0),
          to: source.from + (view?.state.selection.main.to ?? 0),
        })
      : (comments.sourceSelections.get(block.id) ??
        view?.state.selection.main ?? { from: 0, to: 0 });
    comments.open(source?.block ?? block, selection);
  }
  $effect(() => {
    if (view && initialLine) {
      const from = view.state.doc.line(
        Math.min(initialLine, view.state.doc.lines),
      ).from;
      view.dispatch({ selection: { anchor: from }, scrollIntoView: true });
    }
  });
</script>

<div
  class="ui-transcript-text-block"
  role="group"
  data-kind={block.kind}
  data-file-view={fileView || undefined}
  data-block-id={block.id}
  aria-label={`${block.label} content`}
>
  {#if showHeader && block.kind !== "markdown"}<div
      data-ui-part="capture-heading"
    >
      {#if block.path}<FileTypeIcon path={block.path} size="s" />{/if}<span
        >{block.label}</span
      >
    </div>{/if}
  <div class="ui-transcript-text-reader">
    <MiraCodeEditor
      bind:this={editor}
      value={block.text}
      {extensions}
      readonly
      lineNumbers={fileView}
      ariaLabel={block.label}
      variant={fileView ? "code" : "document"}
      surface="frameless"
      height="content"
      minHeight="0"
    />
  </div>
  {#if showActions}<ChatHoverActions
      {block}
      state={comments}
      {reactionTarget}
      {messageActions}
      onComment={comment}
    />{/if}
</div>
