// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import {
  captureComposerSelection,
  createComposerTokens,
  serializeComposerValue,
} from "./composer-tokens.js";

function selectRange(root: HTMLElement, start: number, end = start): void {
  const selection = window.getSelection();
  const range = document.createRange();
  range.setStart(root, start);
  range.setEnd(root, end);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

describe("composer token DOM boundaries", () => {
  it("captures serialized offsets on either side of a token", () => {
    const root = document.createElement("div");
    root.append("A");
    const token = document.createElement("span");
    token.dataset.uiPart = "inline-token";
    token.dataset.uiChatTokenValue = "@ada";
    token.textContent = "Ada";
    root.append(token, "\u00a0", "B");
    document.body.append(root);

    selectRange(root, 1, 2);
    expect(captureComposerSelection(root)).toEqual({ start: 1, end: 5 });
    expect(serializeComposerValue(root)).toBe("A@ada B");
  });

  it("deletes an adjacent non-editable token with a real DOM selection", () => {
    const root = document.createElement("div");
    root.contentEditable = "true";
    document.body.append(root);
    selectRange(root, 0);
    const onChange = vi.fn();
    const tokens = createComposerTokens({
      getEditable: () => root,
      onChange,
    });
    tokens.insertToken({
      value: "Expanded context",
      label: "16 chars",
      variant: "outline",
    });
    expect(root.querySelector('[data-ui-part="inline-token"]')).not.toBeNull();

    selectRange(root, root.childNodes.length);
    const event = new KeyboardEvent("keydown", {
      key: "Backspace",
      cancelable: true,
    });
    expect(tokens.handleDeletion(event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(root.querySelector('[data-ui-part="inline-token"]')).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith("");
  });
});
