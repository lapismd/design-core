import { PREVIEW_INTERACTIVE_SELECTOR } from "@lapismd/mira/codemirror";
import { registerReader } from "./reader-registry.js";
import type { TranscriptBlock } from "./model.js";
import type { TranscriptController } from "./comments.svelte.js";

export function customInteraction(
  node: HTMLElement,
  { block, state }: { block: TranscriptBlock; state: TranscriptController },
) {
  // Reading sections are focusable so keyboard users can comment on the whole view.
  node.tabIndex = 0;
  const open = (text = "") => state.open(block, { from: 0, to: 0 }, text);
  const interactive = (target: EventTarget | null) =>
    target instanceof Element &&
    !!target.closest(`${PREVIEW_INTERACTIVE_SELECTOR},a,[role='link']`);
  const keydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || interactive(event.target)) return;
    if (event.key === "m" && (event.metaKey || event.ctrlKey) && event.altKey) {
      event.preventDefault();
      open();
    } else if (
      !event.isComposing &&
      !event.ctrlKey &&
      !event.metaKey &&
      event.key.length === 1
    ) {
      event.preventDefault();
      open(event.key);
    }
  };
  const paste = (event: ClipboardEvent) => {
    if (event.defaultPrevented || interactive(event.target)) return;
    const text = event.clipboardData?.getData("text/plain");
    if (text) {
      event.preventDefault();
      open(text);
    }
  };
  node.addEventListener("keydown", keydown);
  node.addEventListener("paste", paste);
  const reveal: NonNullable<ReturnType<typeof state.readers.get>> = (
    _anchor,
    scroll = false,
  ) => {
    if (scroll) node.scrollIntoView({ block: "center" });
    node.focus({ preventScroll: true });
  };
  let release = registerReader(state.readers, block.id, reveal);
  return {
    update(next: { block: TranscriptBlock; state: TranscriptController }) {
      release();
      block = next.block;
      state = next.state;
      release = registerReader(state.readers, block.id, reveal);
    },
    destroy() {
      node.removeEventListener("keydown", keydown);
      node.removeEventListener("paste", paste);
      release();
    },
  };
}
