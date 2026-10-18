import { WidgetType } from "@codemirror/view";
import { mount, unmount } from "svelte";
import MarkdownContent from "../markdown-content/MarkdownContent.svelte";
import type { TranscriptProps } from "./model.js";

/** Use Mira's safe reading renderer without replacing the captured source document. */
export class TranscriptMarkdownPreview extends WidgetType {
  private readonly mounted = new WeakMap<
    HTMLElement,
    ReturnType<typeof mount>
  >();
  constructor(
    readonly text: string,
    readonly markdown?: TranscriptProps["markdown"],
    readonly contexts?: Map<unknown, unknown>,
  ) {
    super();
  }
  eq(other: TranscriptMarkdownPreview) {
    return this.text === other.text && this.markdown === other.markdown;
  }
  get estimatedHeight() {
    return Math.max(60, this.text.split("\n").length * 30);
  }
  toDOM() {
    const node = document.createElement("div");
    node.className = "ui-transcript-markdown-preview";
    node.contentEditable = "false";
    this.mounted.set(
      node,
      mount(MarkdownContent, {
        target: node,
        ...(this.contexts === undefined ? {} : { context: this.contexts }),
        props: { ...this.markdown, content: this.text, fullWidth: true },
      }),
    );
    return node;
  }
  destroy(node: HTMLElement) {
    const component = this.mounted.get(node);
    if (component) void unmount(component);
    this.mounted.delete(node);
  }
}
