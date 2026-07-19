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

export function segmentedField<TRoot, TContext = undefined>(
  config: FieldBuilderInput<TRoot, TContext, string>,
) {
  return { ...config, kind: "segmented" as const };
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
