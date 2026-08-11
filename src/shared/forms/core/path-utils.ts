export type FormPathPart = string | number;

export function formPathParts(path: string): FormPathPart[] {
  if (!path) return [];
  return path
    .split(".")
    .map((part) => (/^\d+$/.test(part) ? Number.parseInt(part, 10) : part));
}

export function getFormValueAtPath(root: unknown, path: string): unknown {
  return formPathParts(path).reduce<unknown>((value, part) => {
    if (typeof part === "number" && Array.isArray(value)) return value[part];
    if (
      typeof part === "string" &&
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, root);
}

/** Immutably writes a value while retaining unknown sibling keys. */
export function setFormValueAtPath<TValues>(
  root: TValues,
  path: string,
  value: unknown,
): TValues {
  return setFormValueAtParts(root, formPathParts(path), value);
}

function setFormValueAtParts<TValues>(
  root: TValues,
  parts: FormPathPart[],
  value: unknown,
): TValues {
  if (parts.length === 0) return value as TValues;
  const [head, ...tail] = parts;

  if (typeof head === "number") {
    const next = Array.isArray(root) ? [...root] : [];
    next[head] = setFormValueAtParts(next[head], tail, value);
    return next as TValues;
  }

  const record =
    root !== null && typeof root === "object" && !Array.isArray(root)
      ? (root as Record<string, unknown>)
      : {};
  return {
    ...record,
    [head]: setFormValueAtParts(record[head], tail, value),
  } as TValues;
}

/** Materializes a missing default branch before applying a leaf update. */
export function setFormValueWithDefault<TValues>(
  root: TValues,
  path: string,
  value: unknown,
  defaults?: Partial<TValues>,
  materializeDefaultFrom?: string,
): TValues {
  const seeded =
    materializeDefaultFrom &&
    getFormValueAtPath(root, materializeDefaultFrom) === undefined
      ? setFormValueAtPath(
          root,
          materializeDefaultFrom,
          structuredClone(getFormValueAtPath(defaults, materializeDefaultFrom)),
        )
      : root;
  return setFormValueAtPath(seeded, path, value);
}

export function moveFormArrayItem<TItem>(
  items: readonly TItem[],
  index: number,
  direction: -1 | 1,
): TItem[] {
  const target = index + direction;
  if (
    index < 0 ||
    index >= items.length ||
    target < 0 ||
    target >= items.length
  ) {
    return items as TItem[];
  }
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function removeFormArrayItem<TItem>(
  items: readonly TItem[],
  index: number,
): TItem[] {
  return items.filter((_, itemIndex) => itemIndex !== index);
}
