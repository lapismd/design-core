export function shouldSubmitComposerKey(event: {
  key: string;
  shiftKey?: boolean;
  isComposing?: boolean;
  keyCode?: number;
}): boolean {
  return (
    event.key === "Enter" &&
    !event.shiftKey &&
    !event.isComposing &&
    event.keyCode !== 229
  );
}

export type ComposerHistory = {
  record: (value: string) => void;
  previous: (draft: string) => string | null;
  next: () => string | null;
  reset: () => void;
};

export function createComposerHistory(): ComposerHistory {
  const values: string[] = [];
  let index = -1;
  let draft = "";

  return {
    record(value) {
      if (value && values.at(-1) !== value) values.push(value);
      index = -1;
      draft = "";
    },
    previous(currentDraft) {
      if (values.length === 0) return null;
      if (index === -1) {
        draft = currentDraft;
        index = values.length - 1;
      } else {
        index = Math.max(0, index - 1);
      }
      return values[index] ?? null;
    },
    next() {
      if (index === -1) return null;
      index += 1;
      if (index >= values.length) {
        index = -1;
        return draft;
      }
      return values[index] ?? null;
    },
    reset() {
      index = -1;
      draft = "";
    },
  };
}
