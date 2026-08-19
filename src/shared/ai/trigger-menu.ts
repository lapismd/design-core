import type { ComposerTrigger, ComposerTriggerItem } from "./types.js";

export type TriggerSearchState = {
  query: string;
  items: ComposerTriggerItem[];
  loading: boolean;
  error: Error | null;
};

export type TriggerSearchController = {
  search: (
    trigger: ComposerTrigger,
    query: string,
    onState: (state: TriggerSearchState) => void,
  ) => void;
  cancel: () => void;
};

export type ComposerTriggerMenuPlacement = "above" | "below";

export type ComposerTriggerMenuBox = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

function isUsableBox(
  box: ComposerTriggerMenuBox | null | undefined,
): box is ComposerTriggerMenuBox {
  return Boolean(box && (box.left || box.top || box.right || box.bottom));
}

const CLIPPING_OVERFLOW = new Set(["hidden", "auto", "scroll", "clip"]);

export function nearestClipBottom(
  element: HTMLElement | null | undefined,
  viewportHeight: number,
): number {
  let bottom = viewportHeight;
  let current = element?.parentElement ?? null;
  while (current) {
    const overflowY = current.ownerDocument.defaultView
      ?.getComputedStyle(current)
      .overflowY;
    if (overflowY && CLIPPING_OVERFLOW.has(overflowY)) {
      bottom = Math.min(bottom, current.getBoundingClientRect().bottom);
    }
    current = current.parentElement;
  }
  return bottom;
}

export function positionComposerTriggerMenu(input: {
  caret: ComposerTriggerMenuBox | null | undefined;
  editable: ComposerTriggerMenuBox;
  root: ComposerTriggerMenuBox;
  viewportHeight: number;
  clipBottom?: number;
  gap?: number;
  estimatedMenuHeight?: number;
}): {
  left: number;
  top: number;
  placement: ComposerTriggerMenuPlacement;
} {
  const gap = input.gap ?? 6;
  const estimatedMenuHeight = input.estimatedMenuHeight ?? 288;
  const caret = isUsableBox(input.caret) ? input.caret : input.editable;
  const availableBottom = Math.min(
    input.viewportHeight,
    input.clipBottom ?? input.viewportHeight,
  );
  const spaceBelow = availableBottom - caret.bottom;
  const spaceAbove = caret.top;
  const placement: ComposerTriggerMenuPlacement =
    spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow
      ? "above"
      : "below";
  return {
    left: caret.left - input.root.left,
    top:
      placement === "above"
        ? caret.top - input.root.top
        : caret.bottom - input.root.top + gap,
    placement,
  };
}

export function findActiveComposerTrigger(
  textBeforeCaret: string,
  triggers: ComposerTrigger[],
): { trigger: ComposerTrigger; query: string; start: number } | undefined {
  for (let index = textBeforeCaret.length - 1; index >= 0; index -= 1) {
    const character = textBeforeCaret[index];
    if (character === " " || character === "\n") return;
    const trigger = triggers.find((item) => item.character === character);
    if (!trigger) continue;
    const previous = textBeforeCaret[index - 1];
    if (index === 0 || previous === " " || previous === "\n") {
      return {
        trigger,
        query: textBeforeCaret.slice(index + 1),
        start: index,
      };
    }
  }
}

export function createTriggerSearch(debounceMs = 150): TriggerSearchController {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let abortController: AbortController | undefined;
  let revision = 0;

  function cancel(): void {
    if (timeout) clearTimeout(timeout);
    timeout = undefined;
    abortController?.abort();
    abortController = undefined;
    revision += 1;
  }

  return {
    search(trigger, query, onState) {
      cancel();
      const currentRevision = revision;
      onState({ query, items: [], loading: true, error: null });
      timeout = setTimeout(async () => {
        abortController = new AbortController();
        try {
          const items = await trigger.searchSource(
            query,
            abortController.signal,
          );
          if (abortController.signal.aborted || currentRevision !== revision) {
            return;
          }
          onState({ query, items, loading: false, error: null });
        } catch (error) {
          if (abortController.signal.aborted || currentRevision !== revision) {
            return;
          }
          onState({
            query,
            items: [],
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }, debounceMs);
    },
    cancel,
  };
}
