import { WidgetType, type EditorView } from "@codemirror/view";
import { mount, unmount } from "svelte";
import { Checkbox } from "../../shadcn/checkbox/index.js";

/** Captured task state is display-only; the retained source cannot be toggled. */
export class TranscriptTaskCheckbox extends WidgetType {
  private readonly mounted = new WeakMap<
    HTMLElement,
    ReturnType<typeof mount>
  >();
  constructor(
    readonly checked: boolean,
    readonly label: string,
  ) {
    super();
  }
  eq(other: TranscriptTaskCheckbox) {
    return this.checked === other.checked && this.label === other.label;
  }
  toDOM(view: EditorView) {
    const node = view.dom.ownerDocument.createElement("span");
    node.className = "ui-transcript-task-marker";
    this.mounted.set(
      node,
      mount(Checkbox, {
        target: node,
        props: {
          checked: this.checked,
          disabled: true,
          "aria-label": `Captured task: ${this.label}`,
          tabindex: -1,
        },
      }),
    );
    return node;
  }
  destroy(node: HTMLElement) {
    const component = this.mounted.get(node);
    if (component) void unmount(component);
    this.mounted.delete(node);
  }
  ignoreEvent() {
    return true;
  }
}
