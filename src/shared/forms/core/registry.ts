import type {
  FormFieldAlign,
  FormFieldConfig,
  FormFieldKind,
  FormFieldRenderArgs,
  FormFieldWrapper,
  FormRendererDescriptor,
  FormValidationIssue,
  FormViewName,
} from "./types";

export function fieldIssuesFor<TRoot, TContext, TValue>(
  issues: FormValidationIssue[],
  field: Pick<FormFieldConfig<TRoot, TContext, TValue>, "id" | "path">,
) {
  return issues.filter((issue) => {
    if (issue.fieldId && issue.fieldId === field.id) return true;
    if (issue.path && field.path && issue.path === field.path) return true;
    return false;
  });
}

export function defaultFieldAlign(kind: FormFieldKind): FormFieldAlign {
  if (
    kind === "boolean" ||
    kind === "color" ||
    kind === "options" ||
    kind === "segmented" ||
    kind === "choice"
  ) {
    return "center";
  }
  if (kind === "textarea") return "start";
  return "middle";
}

export function defaultFieldWrapper(kind: FormFieldKind): FormFieldWrapper {
  return kind === "boolean" ||
    kind === "color" ||
    kind === "options" ||
    kind === "segmented" ||
    kind === "choice" ||
    kind === "time" ||
    kind === "tag-list" ||
    kind === "chip-list" ||
    kind === "string-list" ||
    kind === "ordered-string-list" ||
    kind === "reference-list" ||
    kind === "custom"
    ? "div"
    : "label";
}

export function viewFallbacks(view: FormViewName, readonly: boolean) {
  const fallbacks = [view];
  if (readonly && view !== "readonly") fallbacks.push("readonly");
  if (view !== "preview") fallbacks.push("preview");
  if (view !== "edit" && !readonly) fallbacks.push("edit");
  fallbacks.push("default");
  return [...new Set(fallbacks)];
}

export function resolveFieldRenderer<TRoot, TContext, TValue>(
  field: FormFieldConfig<TRoot, TContext, TValue>,
  view: FormViewName,
  readonly: boolean,
): FormRendererDescriptor<TRoot, TContext, TValue> | null {
  if (!field.renderers) return null;
  for (const fallback of viewFallbacks(view, readonly)) {
    const renderer = field.renderers[fallback];
    if (renderer) return renderer;
  }
  return null;
}

export function formatFieldValue<TRoot, TContext, TValue>(
  field: FormFieldConfig<TRoot, TContext, TValue>,
  value: TValue,
  root: TRoot,
  context: TContext,
) {
  if (field.format) return field.format(value, root, context);
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function rendererPropsFor<TRoot, TContext, TValue>(
  descriptor: FormRendererDescriptor<TRoot, TContext, TValue>,
  args: FormFieldRenderArgs<TRoot, TContext, TValue>,
) {
  const extra =
    typeof descriptor.props === "function"
      ? descriptor.props(args)
      : descriptor.props;
  return {
    ...(extra ?? {}),
    ...args,
  };
}
