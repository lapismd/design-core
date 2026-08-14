import type { MergeOptions } from "./types.js";

export const DEFAULT_OPTIONS: Required<MergeOptions> = {
  ignoreWhitespace: false,
  ignoreCase: false,
  lineDiffAlgorithm: "words_with_space",
  workingCopyCenter: false,
};

export function normalizeOptions(
  options?: MergeOptions,
): Required<MergeOptions> {
  return { ...DEFAULT_OPTIONS, ...options };
}

export function normalizeComparableLine(
  line: string,
  options: Required<MergeOptions>,
): string {
  let normalized = options.ignoreWhitespace ? line.replace(/\s+/g, "") : line;
  if (options.ignoreCase) {
    normalized = normalized.toLocaleLowerCase();
  }
  return normalized;
}
