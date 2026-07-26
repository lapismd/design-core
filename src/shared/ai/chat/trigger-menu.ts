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
