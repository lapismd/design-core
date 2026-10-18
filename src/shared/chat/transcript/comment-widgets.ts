import { mount, unmount, tick } from "svelte";
import {
  Decoration,
  WidgetType,
  type DecorationSet,
  type EditorView,
} from "@codemirror/view";
import { estimateMarkdownBlockHeight } from "@lapismd/mira/codemirror";
import type { TranscriptBlock } from "./model.js";
import type { TranscriptController } from "./comments.svelte.js";
import ChatCommentArea from "./ChatCommentArea.svelte";
import { richBlockRanges } from "./rich-source.js";
import { localAnchor, type ReaderSource } from "./reader-source.js";

const mounts = new WeakMap<HTMLElement, ReturnType<typeof mount>>();
const observers = new WeakMap<HTMLElement, ResizeObserver>();
class CommentWidget extends WidgetType {
  constructor(
    readonly state: TranscriptController,
    readonly block: TranscriptBlock,
    readonly contexts: Map<unknown, unknown>,
    readonly threadId: string,
  ) {
    super();
  }
  eq(other: CommentWidget) {
    return (
      this.state === other.state &&
      this.block.id === other.block.id &&
      this.block.revision === other.block.revision &&
      this.threadId === other.threadId
    );
  }
  get estimatedHeight() {
    const thread = this.state.threads.find((t) => t.id === this.threadId);
    return (
      32 +
      (thread?.comments
        .filter((comment) => !comment.replyTo)
        .reduce(
          (height, c) => height + estimateMarkdownBlockHeight(c.text) + 32,
          0,
        ) ?? 48)
    );
  }
  toDOM(view: EditorView) {
    const target = document.createElement("div");
    target.contentEditable = "false";
    target.className = "ui-transcript-comment-widget";
    const instance = mount(ChatCommentArea, {
      target,
      context: this.contexts,
      props: { state: this.state, threadId: this.threadId },
    });
    mounts.set(target, instance);
    const observer = new ResizeObserver(() => view.requestMeasure());
    observer.observe(target);
    observers.set(target, observer);
    void tick().then(() => {
      if (target.isConnected) view.requestMeasure();
    });
    return target;
  }
  ignoreEvent() {
    return true;
  }
  destroy(dom: HTMLElement) {
    observers.get(dom)?.disconnect();
    observers.delete(dom);
    const instance = mounts.get(dom);
    if (instance) void unmount(instance);
    mounts.delete(dom);
  }
}

export function commentDecorations(
  block: TranscriptBlock,
  state: TranscriptController,
  contexts: Map<unknown, unknown>,
  source?: ReaderSource,
): DecorationSet {
  const richRanges =
    block.kind === "markdown" ? richBlockRanges(block.text) : [];
  const anchors = state.visibleThreads
    .filter(
      (t) =>
        localAnchor(block, t.anchor, source) &&
        !(
          block.kind === "markdown" &&
          richRanges.some(
            (table) => t.anchor.from >= table.from && t.anchor.to <= table.to,
          )
        ),
    )
    .map((t) => ({
      anchor: localAnchor(block, t.anchor, source)!,
      threadId: t.id,
    }));
  const ranges = anchors.map(({ anchor, threadId }) => {
    const newline = block.text.indexOf("\n", anchor.to);
    const rich =
      block.kind === "markdown"
        ? richRanges.find(
            (range) => anchor.from >= range.from && anchor.to <= range.to,
          )
        : undefined;
    const position = rich?.to ?? (newline < 0 ? block.text.length : newline);
    return Decoration.widget({
      block: true,
      side: 1,
      widget: new CommentWidget(
        state,
        source?.block ?? block,
        contexts,
        threadId,
      ),
    }).range(position);
  });
  for (const { anchor, threadId } of anchors) {
    if (anchor.to > anchor.from)
      ranges.push(
        Decoration.mark({
          class: `ui-transcript-comment-highlight${state.active?.threadId === threadId || state.highlightedThread === threadId ? " ui-transcript-comment-highlight-active" : ""}`,
        }).range(anchor.from, anchor.to),
      );
  }
  return Decoration.set(ranges, true);
}
