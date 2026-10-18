import { WidgetType, type EditorView } from "@codemirror/view";
import { mount, unmount } from "svelte";
import MarkdownContent from "../markdown-content/MarkdownContent.svelte";
import RichMarkdownPreview from "./RichMarkdownPreview.svelte";
import type { RichSourceContext } from "./rich-source.js";
import type { TranscriptProps } from "./model.js";

/** Use Mira's safe reading renderer without replacing the captured source document. */
export class TranscriptMarkdownPreview extends WidgetType {
  private readonly observers = new WeakMap<HTMLElement, ResizeObserver>();
  private readonly mounted = new WeakMap<
    HTMLElement,
    ReturnType<typeof mount>
  >();
  constructor(
    readonly text: string,
    readonly markdown?: TranscriptProps["markdown"],
    readonly contexts?: Map<unknown, unknown>,
    readonly source?: RichSourceContext,
    readonly offset = 0,
  ) {
    super();
  }
  eq(other: TranscriptMarkdownPreview) {
    return (
      this.text === other.text &&
      this.markdown === other.markdown &&
      this.offset === other.offset &&
      this.source?.block.revision === other.source?.block.revision &&
      this.source?.block.text === other.source?.block.text &&
      this.source?.comments === other.source?.comments
    );
  }
  get estimatedHeight() {
    return Math.max(60, this.text.split("\n").length * 30);
  }
  toDOM(view: EditorView) {
    const node = document.createElement("div");
    node.className = "ui-transcript-markdown-preview";
    node.contentEditable = "false";
    const options = {
      target: node,
      ...(this.contexts === undefined ? {} : { context: this.contexts }),
    };
    this.mounted.set(
      node,
      this.source
        ? mount(RichMarkdownPreview, {
            ...options,
            props: {
              text: this.text,
              offset: this.offset,
              source: this.source,
              ...(this.markdown ? { markdown: this.markdown } : {}),
            },
          })
        : mount(MarkdownContent, {
            ...options,
            props: { ...this.markdown, content: this.text, fullWidth: true },
          }),
    );
    const observer = new ResizeObserver(() => view.requestMeasure());
    observer.observe(node);
    this.observers.set(node, observer);
    return node;
  }
  destroy(node: HTMLElement) {
    this.observers.get(node)?.disconnect();
    this.observers.delete(node);
    const component = this.mounted.get(node);
    if (component) void unmount(component);
    this.mounted.delete(node);
  }
}
