import type { FilterCommandOption } from "./picker-options";

type WeightedKey = {
  name: keyof FilterCommandOption | "keywords";
  weight: number;
};

const FILTER_KEYS: readonly WeightedKey[] = [
  { name: "label", weight: 3 },
  { name: "value", weight: 2 },
  { name: "keywords", weight: 2 },
  { name: "description", weight: 1 },
];

function fieldValues(
  option: FilterCommandOption,
  name: WeightedKey["name"],
): string[] {
  if (name === "keywords") return option.keywords ?? [];
  const value = option[name];
  return typeof value === "string" && value ? [value] : [];
}

/** Lower scores are better. `null` means no match. */
function scoreField(
  haystack: string,
  needle: string,
  weight: number,
): number | null {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (!n) return 0;
  if (h === n) return 0;
  if (h.startsWith(n)) return 0.05 / weight;
  if (h.includes(n)) return 0.15 / weight;

  let index = 0;
  for (const char of n) {
    index = h.indexOf(char, index);
    if (index === -1) return null;
    index += 1;
  }
  return 0.35 / weight;
}

function scoreOption(
  option: FilterCommandOption,
  needle: string,
): number | null {
  let best: number | null = null;
  for (const key of FILTER_KEYS) {
    for (const field of fieldValues(option, key.name)) {
      const score = scoreField(field, needle, key.weight);
      if (score === null) continue;
      if (best === null || score < best) best = score;
    }
  }
  return best;
}

/** Rank picker options while giving their visible label priority. */
export function filterCommandOptions(
  options: readonly FilterCommandOption[],
  query: string,
): FilterCommandOption[] {
  const needle = query.trim();
  if (!needle) return [...options];

  return options
    .map((option, refIndex) => ({
      option,
      refIndex,
      score: scoreOption(option, needle),
    }))
    .filter(
      (
        entry,
      ): entry is {
        option: FilterCommandOption;
        refIndex: number;
        score: number;
      } => entry.score !== null,
    )
    .sort((a, b) => a.score - b.score || a.refIndex - b.refIndex)
    .map((entry) => entry.option);
}

/** Custom picker entries remain exact even though visible suggestions are ranked. */
export function hasExactFilterCommandOption(
  options: readonly FilterCommandOption[],
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  return options.some(
    (option) =>
      option.value.toLowerCase() === needle ||
      option.label.toLowerCase() === needle,
  );
}

/** De-duplicate chip suggestions before ranking the visible options. */
export function autocompleteSuggestions(
  suggestions: readonly string[],
  query: string,
  limit = 8,
): string[] {
  const seen = new Set<string>();
  const unique = suggestions
    .map((suggestion) => suggestion.trim())
    .filter(Boolean)
    .filter((suggestion) => {
      const key = suggestion.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((value) => ({ value, label: value }));

  return filterCommandOptions(unique, query)
    .slice(0, limit)
    .map((suggestion) => suggestion.value);
}
