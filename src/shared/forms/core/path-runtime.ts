import type {
  AnyPathFormFieldConfig,
  RuntimePathFormConfig,
} from "./path-config";
import { getFormValueAtPath, setFormValueWithDefault } from "./path-utils";
import type { FormFieldConfig } from "./types";

export function formFieldLabel(path: string): string {
  const tail = path.split(".").at(-1) ?? path;
  return tail
    .replaceAll("_", " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function formFieldId(formId: string, path: string): string {
  return `${formId}-${path}`.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

export function pathFormEntries<TValues, TContext>(
  config: RuntimePathFormConfig<TValues, TContext>,
): Array<[string, AnyPathFormFieldConfig]> {
  return Object.entries(config.fields).filter(
    (entry): entry is [string, AnyPathFormFieldConfig] => Boolean(entry[1]),
  );
}

export function normalizePathField<TValues, TContext>(
  form: RuntimePathFormConfig<TValues, TContext>,
  path: string,
  source: AnyPathFormFieldConfig,
): FormFieldConfig<TValues, TContext, unknown> | null {
  if (source.kind === "array" || source.kind === "variant-array") return null;
  const options = source.options;
  const suggestions = source.suggestions;
  const referenceIndex = source.referenceIndex;
  return {
    ...source,
    id: source.id ?? formFieldId(form.id, path),
    label: source.label ?? formFieldLabel(path),
    kind: source.kind,
    path,
    get: (root) =>
      getFormValueAtPath(root, path) ??
      source.defaultValue ??
      getFormValueAtPath(form.defaults, path),
    set: (root, value) =>
      setFormValueWithDefault(
        root,
        path,
        value,
        form.defaults,
        typeof source.materializeDefaultFrom === "string"
          ? source.materializeDefaultFrom
          : undefined,
      ),
    options:
      typeof options === "function"
        ? ({ root, value, context }) => options({ root, value, context })
        : options,
    suggestions:
      typeof suggestions === "function"
        ? ({ root, value, context }) => suggestions({ root, value, context })
        : suggestions,
    referenceIndex:
      typeof referenceIndex === "function"
        ? ({ root, value, context }) => referenceIndex({ root, value, context })
        : referenceIndex,
  } as FormFieldConfig<TValues, TContext, unknown>;
}
