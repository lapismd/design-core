import type {
  ComposerInputHandle,
  ComposerToken,
  ComposerTrigger,
} from "./types.js";

const TOKEN_SELECTOR = '[data-ui-part="inline-token"]';

export type ComposerSelectionSnapshot = {
  start: number;
  end: number;
};

export type ComposerTokensOptions = {
  getEditable: () => HTMLDivElement | null;
  onChange?: (value: string) => void;
  idPrefix?: string;
};

export type ComposerTokensController = {
  insertToken: (token: ComposerToken) => string | undefined;
  expandToken: (id: string) => void;
  handleDeletion: (event: KeyboardEvent) => boolean;
  protectPasteBoundary: () => void;
  cleanup: () => void;
};

function isElement(node: Node | null): node is HTMLElement {
  return node?.nodeType === 1;
}

function isText(node: Node | null): node is Text {
  return node?.nodeType === 3;
}

function isToken(node: Node | null): boolean {
  return isElement(node) && node.matches(TOKEN_SELECTOR);
}

function tokenValue(node: HTMLElement): string {
  return node.dataset.uiChatTokenValue ?? "";
}

function serializeNode(node: Node): string {
  if (isText(node)) return (node.data ?? "").replaceAll("\u00a0", " ");
  if (!isElement(node)) return "";
  if (isToken(node)) return tokenValue(node as HTMLElement);
  if (node.tagName === "BR") return "\n";

  const content = Array.from(node.childNodes, serializeNode).join("");
  const isBlock = /^(DIV|P|LI)$/.test(node.tagName);
  return isBlock ? `${content}\n` : content;
}

/** Deterministically serialize text and inline tokens from a composer DOM. */
export function serializeComposerValue(root: HTMLElement): string {
  return Array.from(root.childNodes, serializeNode)
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n$/, "");
}

function nodeLength(node: Node): number {
  return serializeNode(node).length;
}

function offsetWithin(root: Node, target: Node, targetOffset: number): number {
  let offset = 0;
  let found = false;

  function visit(node: Node): void {
    if (found) return;
    if (node === target) {
      if (isText(node)) {
        offset += Math.min(targetOffset, node.data.length);
      } else {
        for (let index = 0; index < targetOffset; index += 1) {
          const child = node.childNodes.item(index);
          if (child) offset += nodeLength(child);
        }
      }
      found = true;
      return;
    }

    if (isText(node) || isToken(node)) {
      offset += nodeLength(node);
      return;
    }

    for (const child of node.childNodes) visit(child);
  }

  visit(root);
  return offset;
}

/** Capture a DOM selection as serialized-value offsets. */
export function captureComposerSelection(
  root: HTMLElement,
  selection: Selection | null = typeof window === "undefined"
    ? null
    : window.getSelection(),
): ComposerSelectionSnapshot | null {
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (
    !root.contains(range.startContainer) ||
    !root.contains(range.endContainer)
  ) {
    return null;
  }

  return {
    start: offsetWithin(root, range.startContainer, range.startOffset),
    end: offsetWithin(root, range.endContainer, range.endOffset),
  };
}

function locateOffset(
  root: HTMLElement,
  wanted: number,
): { node: Node; offset: number } {
  let remaining = Math.max(0, wanted);
  let fallback: { node: Node; offset: number } = {
    node: root,
    offset: root.childNodes.length,
  };

  function visit(node: Node): { node: Node; offset: number } | null {
    if (isText(node)) {
      if (remaining <= node.data.length) return { node, offset: remaining };
      remaining -= node.data.length;
      fallback = { node, offset: node.data.length };
      return null;
    }
    if (isToken(node)) {
      const token = node as HTMLElement;
      const length = tokenValue(token).length;
      const parent = node.parentNode;
      if (remaining <= length && parent) {
        const index = Array.prototype.indexOf.call(parent.childNodes, node);
        return {
          node: parent,
          offset: remaining < length / 2 ? index : index + 1,
        };
      }
      remaining -= length;
      return null;
    }
    if (isElement(node) && node.tagName === "BR") {
      if (remaining === 0 && node.parentNode) {
        const index = Array.prototype.indexOf.call(
          node.parentNode.childNodes,
          node,
        );
        return { node: node.parentNode, offset: index };
      }
      remaining = Math.max(0, remaining - 1);
      return null;
    }
    for (const child of node.childNodes) {
      const located = visit(child);
      if (located) return located;
    }
    return null;
  }

  return visit(root) ?? fallback;
}

/** Restore a serialized-offset selection after a controlled DOM update. */
export function restoreComposerSelection(
  root: HTMLElement,
  snapshot: ComposerSelectionSnapshot | null,
  selection: Selection | null = typeof window === "undefined"
    ? null
    : window.getSelection(),
): void {
  if (!snapshot || !selection || typeof document === "undefined") return;
  const start = locateOffset(root, snapshot.start);
  const end = locateOffset(root, snapshot.end);
  const range = document.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function ensureComposerCaret(root: HTMLElement): Selection | null {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }
  const selection = window.getSelection();
  if (!selection) return null;
  if (
    selection.rangeCount > 0 &&
    root.contains(selection.getRangeAt(0).startContainer)
  ) {
    return selection;
  }
  const range = document.createRange();
  range.selectNodeContents(root);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

export function insertComposerText(root: HTMLElement, text: string): void {
  const selection = ensureComposerCaret(root);
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function tokenLabel(token: ComposerToken): string {
  return "label" in token && token.label ? token.label : token.value;
}

function makeTokenElement(token: ComposerToken, id: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.contentEditable = "false";
  span.dataset.uiComponent = "ai-chat-composer-token";
  span.dataset.uiPart = "inline-token";
  span.dataset.uiChatTokenId = id;
  span.dataset.uiChatTokenValue = token.value;
  span.dataset.variant =
    "variant" in token ? (token.variant ?? "secondary") : "secondary";
  span.setAttribute("role", "button");
  span.setAttribute("aria-label", `${tokenLabel(token)} token`);
  span.textContent = tokenLabel(token);
  return span;
}

function adjacentToken(
  root: HTMLElement,
  selection: Selection,
  direction: "backward" | "forward",
): { token: HTMLElement; space: Text | null } | null {
  if (!selection.isCollapsed || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const container = range.startContainer;
  const offset = range.startOffset;
  if (!root.contains(container)) return null;

  if (isText(container)) {
    if (direction === "backward") {
      const prefix = container.data.slice(0, offset);
      if (prefix && prefix !== "\u00a0") return null;
      const previous = container.previousSibling;
      if (isToken(previous)) {
        return {
          token: previous as HTMLElement,
          space: container.data === "\u00a0" ? container : null,
        };
      }
    } else {
      const suffix = container.data.slice(offset);
      if (suffix && suffix !== "\u00a0") return null;
      const next = container.nextSibling;
      if (isToken(next)) {
        return {
          token: next as HTMLElement,
          space: container.data === "\u00a0" ? container : null,
        };
      }
    }
  } else if (isElement(container)) {
    const childIndex = direction === "backward" ? offset - 1 : offset;
    const child = container.childNodes.item(childIndex);
    if (isToken(child)) return { token: child as HTMLElement, space: null };
    if (isText(child) && child.data === "\u00a0") {
      const neighbor =
        direction === "backward" ? child.previousSibling : child.nextSibling;
      if (isToken(neighbor)) {
        return { token: neighbor as HTMLElement, space: child };
      }
    }
  }

  return null;
}

export function createComposerTokens(
  options: ComposerTokensOptions,
): ComposerTokensController {
  let id = 0;

  function emit(): void {
    const editable = options.getEditable();
    if (editable) options.onChange?.(serializeComposerValue(editable));
  }

  function insertToken(token: ComposerToken): string | undefined {
    const editable = options.getEditable();
    if (!editable || typeof document === "undefined") return;
    const selection = ensureComposerCaret(editable);
    if (!selection || selection.rangeCount === 0) return;

    const tokenId = `${options.idPrefix ?? "chat-token"}-${++id}`;
    const span = makeTokenElement(token, tokenId);
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);
    const space = document.createTextNode("\u00a0");
    span.after(space);
    range.setStartAfter(space);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    emit();
    return tokenId;
  }

  function expandToken(tokenId: string): void {
    const editable = options.getEditable();
    const span = editable?.querySelector<HTMLElement>(
      `[data-ui-chat-token-id="${CSS.escape(tokenId)}"]`,
    );
    if (!span || typeof document === "undefined") return;
    const text = document.createTextNode(tokenValue(span));
    span.replaceWith(text);
    const selection = ensureComposerCaret(editable!);
    if (selection) {
      const range = document.createRange();
      range.setStartAfter(text);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    emit();
  }

  function handleDeletion(event: KeyboardEvent): boolean {
    if (event.key !== "Backspace" && event.key !== "Delete") return false;
    const editable = options.getEditable();
    const selection =
      typeof window === "undefined" ? null : window.getSelection();
    if (!editable || !selection) return false;
    const adjacent = adjacentToken(
      editable,
      selection,
      event.key === "Backspace" ? "backward" : "forward",
    );
    if (!adjacent) return false;
    event.preventDefault();
    const parent = adjacent.token.parentNode;
    adjacent.space?.remove();
    adjacent.token.remove();
    if (parent && typeof document !== "undefined") {
      const range = document.createRange();
      range.selectNodeContents(parent);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    emit();
    return true;
  }

  function protectPasteBoundary(): void {
    const editable = options.getEditable();
    const selection =
      typeof window === "undefined" ? null : window.getSelection();
    if (!editable || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    let node: Node | null = range.startContainer;
    while (node && node !== editable && !isToken(node)) node = node.parentNode;
    if (!node || !isToken(node)) return;
    range.setStartAfter(node.nextSibling ?? node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  return {
    insertToken,
    expandToken,
    handleDeletion,
    protectPasteBoundary,
    cleanup() {
      const editable = options.getEditable();
      editable
        ?.querySelectorAll<HTMLElement>(TOKEN_SELECTOR)
        .forEach((token) => {
          if (!token.dataset.uiChatTokenValue) token.remove();
        });
    },
  };
}

export type PasteAsTokenOptions = {
  input: () => ComposerInputHandle | null;
  threshold?: number;
  toToken?: (text: string) => ComposerToken;
};

export type PasteAsTokenController = {
  shouldTokenize: (text: string) => boolean;
  insert: (text: string) => boolean;
};

/** Convert long plain-text pastes into expandable composer tokens. */
export function createPasteAsToken(
  options: PasteAsTokenOptions,
): PasteAsTokenController {
  const threshold = options.threshold ?? 200;
  return {
    shouldTokenize: (text) => text.length >= threshold,
    insert(text) {
      if (text.length < threshold) return false;
      const lines = text.split(/\r?\n/).length;
      const label =
        lines > 1
          ? `${lines} lines, ${text.length} chars`
          : `${text.length} chars`;
      const token =
        options.toToken?.(text) ??
        ({
          value: text,
          label,
          variant: "outline",
        } satisfies ComposerToken);
      return options.input()?.insertToken(token) != null;
    },
  };
}

export function deserializeComposerTokens(
  value: string,
  triggers: ComposerTrigger[],
): Array<string | ComposerToken> {
  if (!value || triggers.length === 0) return [value];
  const result: Array<string | ComposerToken> = [];
  let cursor = 0;
  while (cursor < value.length) {
    let next:
      | { index: number; value: string; token: ComposerToken }
      | undefined;
    for (let index = cursor; index < value.length; index += 1) {
      for (const trigger of triggers) {
        const candidate = value.slice(index).split(/\s/)[0] ?? "";
        const token = trigger.deserialize?.(candidate);
        if (token) {
          next = { index, value: candidate, token };
          break;
        }
      }
      if (next) break;
    }
    if (!next) {
      result.push(value.slice(cursor));
      break;
    }
    if (next.index > cursor) result.push(value.slice(cursor, next.index));
    result.push(next.token);
    cursor = next.index + next.value.length;
  }
  return result;
}
