/** Both modules stay out of the initial picker/ReactionBar chunk. */
export function loadEmojiMart() {
  return Promise.all([import("emoji-mart"), import("@emoji-mart/data")]);
}

/** Correct generated semantics without hiding any interactive content from axe. */
export function normalizeEmojiMart(
  root: ShadowRoot,
  searchLabel: string,
): void {
  root.querySelector("header")?.setAttribute("role", "presentation");
  root.querySelector("input")?.setAttribute("aria-label", searchLabel);
  for (const button of root.querySelectorAll(
    "button[aria-posinset], button[aria-setsize]",
  )) {
    button.removeAttribute("aria-posinset");
    button.removeAttribute("aria-setsize");
  }
  for (const button of root.querySelectorAll("button[aria-selected]")) {
    if (button.getAttribute("aria-selected") === "true")
      button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
    button.removeAttribute("aria-selected");
  }
  const scroll = root.querySelector<HTMLElement>(".scroll");
  if (scroll) {
    scroll.tabIndex = 0;
    scroll.setAttribute("aria-label", "Emoji results");
  }
}
