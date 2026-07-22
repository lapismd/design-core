import ReviewedStringListFormField from "../form-review/ReviewedStringListFormField.svelte";
import ReviewedTextFormField from "../form-review/ReviewedTextFormField.svelte";
import type { FieldReviewContext } from "./field-review";
import type {
  FormConfig,
  FormCustomRenderer,
  FormFieldConfig,
  FormFieldKind,
  FormFieldRenderArgs,
  FormFieldWrapper,
  FormRendererDescriptor,
  FormViewName,
} from "./types";

type FieldBuilderInput<TRoot, TContext, TValue> = Omit<
  FormFieldConfig<TRoot, TContext, TValue>,
  "kind"
> & {
  kind?: FormFieldKind;
};

type CustomViewFieldBuilderInput<TRoot, TContext, TValue> = Omit<
  FieldBuilderInput<TRoot, TContext, TValue>,
  "renderers"
> & {
  component: FormCustomRenderer<TRoot, TContext, TValue>;
  view?: FormViewName | "default";
  wrapper?: "field" | "none";
  interactive?: boolean;
  align?: FormRendererDescriptor<TRoot, TContext, TValue>["align"];
  as?: FormFieldWrapper;
  props?:
    | Record<string, unknown>
    | ((
        args: FormFieldRenderArgs<TRoot, TContext, TValue>,
      ) => Record<string, unknown>);
};

export function createFormConfig<TRoot, TContext = undefined>(
  config: FormConfig<TRoot, TContext>,
) {
  return config;
}

export function field<TRoot, TContext = undefined, TValue = unknown>(
  config: FormFieldConfig<TRoot, TContext, TValue>,
) {
  return config;
}

export function textField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, string>,
) {
  return { ...config, kind: "text" as const };
}

export function textareaField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, string>,
) {
  return { ...config, kind: "textarea" as const };
}

export function dateField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, string>,
) {
  return { ...config, kind: "date" as const };
}

export function readonlyField<TRoot, TContext = undefined, TValue = unknown>(
  config: FieldBuilderInput<TRoot, TContext, TValue>,
) {
  return { ...config, kind: "readonly" as const, readonly: true };
}

export function timestampField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, string>,
) {
  return { ...config, kind: "timestamp" as const, readonly: true };
}

export function booleanField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, boolean>,
) {
  return { ...config, kind: "boolean" as const };
}

export function optionField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, string>,
) {
  return { ...config, kind: "options" as const };
}

export function choiceField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, string>,
) {
  return {
    ...config,
    kind: "choice" as const,
    presentation: config.presentation ?? "menu",
  };
}

export function segmentedField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, string>,
) {
  return { ...config, kind: "segmented" as const };
}

/** Chip-style multi-value list (`ChipAutocomplete`). */
export function stringListField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, string[]>,
) {
  return { ...config, kind: "string-list" as const };
}

/** Ordered editable string list (`ListEditor`) — Roles/Tags style, not chips. */
export function orderedStringListField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, string[]>,
) {
  return { ...config, kind: "ordered-string-list" as const };
}

export function tagListField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, string[]>,
) {
  return { ...config, kind: "tag-list" as const };
}

export function chipListField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, string[]>,
) {
  return { ...config, kind: "chip-list" as const };
}

export function referenceListField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, string[]>,
) {
  return { ...config, kind: "reference-list" as const };
}

export function customField<TRoot, TContext = undefined, TValue = unknown>(
  config: FieldBuilderInput<TRoot, TContext, TValue>,
) {
  return { ...config, kind: "custom" as const };
}

export function customViewField<TRoot, TContext = undefined, TValue = TRoot>(
  config: CustomViewFieldBuilderInput<TRoot, TContext, TValue>,
) {
  const {
    component,
    view = "preview",
    wrapper = "none",
    interactive,
    align,
    as,
    props,
    ...fieldConfig
  } = config;
  return customField<TRoot, TContext, TValue>({
    ...fieldConfig,
    renderers: {
      [view]: {
        component,
        wrapper,
        interactive,
        align,
        as,
        props,
      },
    },
  });
}

export function readonlyView(view: FormViewName) {
  return view === "preview" || view === "readonly";
}

type ReviewedTextFieldOptions<TRoot> = {
  id: string;
  label: string;
  placeholder?: string;
  inputType?: string;
  multiline?: boolean;
  multilineSize?: "normal" | "compact";
  get: (root: TRoot, context: FieldReviewContext) => string;
  set: (root: TRoot, value: string, context: FieldReviewContext) => TRoot;
};

/** Text field that swaps to unified-diff Keep/Undo when review context matches. */
export function reviewedTextField<TRoot>({
  id,
  label,
  placeholder,
  inputType,
  multiline = false,
  multilineSize = "normal",
  get,
  set,
}: ReviewedTextFieldOptions<TRoot>): FormFieldConfig<
  TRoot,
  FieldReviewContext,
  string
> {
  return textField<TRoot, FieldReviewContext>({
    id,
    label,
    placeholder,
    inputType,
    get,
    set,
    renderers: {
      edit: {
        component: ReviewedTextFormField,
        wrapper: "none",
        interactive: true,
        props: {
          reviewKey: id,
          inputType,
          multiline,
          multilineSize,
        },
      },
    },
  });
}

type ReviewedStringListFieldOptions<TRoot> = {
  id: string;
  label: string;
  addLabel?: string;
  placeholder?: string;
  multiline?: boolean;
  multilineSize?: "normal" | "compact";
  get: (root: TRoot, context: FieldReviewContext) => string[];
  set: (root: TRoot, value: string[], context: FieldReviewContext) => TRoot;
};

/** Ordered string-list with per-item Keep/Undo when review context matches. */
export function reviewedStringListField<TRoot>({
  id,
  label,
  addLabel = "Add",
  placeholder,
  multiline = true,
  multilineSize = "normal",
  get,
  set,
}: ReviewedStringListFieldOptions<TRoot>): FormFieldConfig<
  TRoot,
  FieldReviewContext,
  string[]
> {
  return {
    ...orderedStringListField<TRoot, FieldReviewContext>({
      id,
      label,
      addLabel,
      placeholder,
      get,
      set,
    }),
    renderers: {
      edit: {
        component: ReviewedStringListFormField,
        wrapper: "none",
        interactive: true,
        props: {
          reviewKey: id,
          addLabel,
          multiline,
          multilineSize,
          placeholder,
        },
      },
    },
  };
}
