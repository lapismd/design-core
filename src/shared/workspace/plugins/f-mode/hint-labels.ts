export const DEFAULT_FMODE_ALPHABET = "asdfghjklqwertyuiopzxcvbnm";

export interface FModeTargetLike {
  id: string;
}

export interface FModeEntry<Target extends FModeTargetLike = FModeTargetLike> {
  target: Target;
  hint: string;
  index: number;
}

export interface FModeQueryState<
  Target extends FModeTargetLike = FModeTargetLike,
> {
  query: string;
  visible: FModeEntry<Target>[];
  exactMatch?: FModeEntry<Target>;
}

export interface FModeAdvanceResult<
  Target extends FModeTargetLike = FModeTargetLike,
> {
  accepted: boolean;
  state: FModeQueryState<Target>;
}

export function normalizeFModeAlphabet(alphabet: string): string[] {
  return Array.from(
    new Set(
      alphabet
        .toLocaleLowerCase()
        .split("")
        .filter((character) => /[a-z0-9]/u.test(character)),
    ),
  );
}

export function createHintLabels(
  count: number,
  alphabet = DEFAULT_FMODE_ALPHABET,
): string[] {
  if (count <= 0) return [];
  const characters = normalizeFModeAlphabet(alphabet);
  if (characters.length === 0) {
    throw new Error(
      "F-Mode alphabet must contain at least one alphanumeric key",
    );
  }
  const labels = [...characters];
  while (labels.length < count) {
    const shortestLength = Math.min(...labels.map((label) => label.length));
    let indexToExpand = -1;
    for (let index = labels.length - 1; index >= 0; index -= 1) {
      if (labels[index]?.length === shortestLength) {
        indexToExpand = index;
        break;
      }
    }
    const prefix = labels[indexToExpand];
    if (!prefix) throw new Error("Unable to generate enough F-Mode labels");
    labels.splice(
      indexToExpand,
      1,
      ...characters.map((character) => `${prefix}${character}`),
    );
  }
  return labels.slice(0, count);
}

export function createFModeEntries<Target extends FModeTargetLike>(
  targets: Target[],
  alphabet = DEFAULT_FMODE_ALPHABET,
): FModeEntry<Target>[] {
  const labels = createHintLabels(targets.length, alphabet);
  return targets.map((target, index) => ({
    target,
    hint: labels[index]!,
    index,
  }));
}

export function resolveFModeQuery<Target extends FModeTargetLike>(
  entries: FModeEntry<Target>[],
  query: string,
): FModeQueryState<Target> {
  const normalized = query.toLocaleLowerCase();
  if (!normalized) return { query: "", visible: entries };
  const visible = entries.filter((entry) => entry.hint.startsWith(normalized));
  return {
    query: normalized,
    visible,
    exactMatch: visible.find((entry) => entry.hint === normalized),
  };
}

export function normalizeFModeKey(key: string): string | null {
  return /^[a-z0-9]$/iu.test(key) ? key.toLocaleLowerCase() : null;
}

export function advanceFModeQuery<Target extends FModeTargetLike>(
  entries: FModeEntry<Target>[],
  currentQuery: string,
  nextKey: string,
): FModeAdvanceResult<Target> {
  const normalizedKey = normalizeFModeKey(nextKey);
  if (!normalizedKey) {
    return {
      accepted: false,
      state: resolveFModeQuery(entries, currentQuery),
    };
  }
  const nextState = resolveFModeQuery(
    entries,
    `${currentQuery}${normalizedKey}`,
  );
  return nextState.visible.length
    ? { accepted: true, state: nextState }
    : {
        accepted: false,
        state: resolveFModeQuery(entries, currentQuery),
      };
}
