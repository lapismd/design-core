import type { Component } from "svelte";
import type { HTMLInputAttributes } from "svelte/elements";
import type { InlineOptionPickerOption } from "../inline-option-picker/InlineOptionPicker.svelte";
import type { ReferenceIndex } from "./reference-utils";

export type FormViewName = "edit" | "preview" | "readonly" | (string & {});

export type FormFieldKind =
  | "text"
  | "textarea"
  | "date"
  | "readonly"
  | "timestamp"
  | "boolean"
  | "options"
  | "segmented"
  | "choice"
  | "string-list"
  | "tag-list"
  | "chip-list"
  | "reference-list"
  | "custom";

/** `middle` = vertically center label with control; `start` = top (multiline); `center` = pill controls. */
export type FormFieldAlign = "start" | "center" | "middle";
export type FormFieldWrapper = "label" | "div";

export type FormValidationIssue = {
  fieldId?: string;
  path?: string;
  message: string;
  severity?: "error" | "warning" | "info";
};

export type FormFieldRenderArgs<TRoot, TContext, TValue> = {
  root: TRoot;
  value: TValue;
  field: FormFieldConfig<TRoot, TContext, TValue>;
  view: FormViewName;
  context: TContext;
  issues: FormValidationIssue[];
  readonly: boolean;
  update: (value: TValue) => void | Promise<void>;
  updateRoot: (value: TRoot) => void | Promise<void>;
};

export type FormRendererProps<TRoot, TContext, TValue> = FormFieldRenderArgs<
  TRoot,
  TContext,
  TValue
> &
  Record<string, unknown>;

export type FormCustomRenderer<TRoot, TContext, TValue> = Component<
  FormRendererProps<TRoot, TContext, TValue>
>;

export type FormRendererDescriptor<TRoot, TContext, TValue> = {
  component: FormCustomRenderer<TRoot, TContext, TValue>;
  wrapper?: "field" | "none";
  interactive?: boolean;
  align?: FormFieldAlign;
  as?: FormFieldWrapper;
  props?:
    | Record<string, unknown>
    | ((
        args: FormFieldRenderArgs<TRoot, TContext, TValue>,
      ) => Record<string, unknown>);
};

export type FormRendererMap<TRoot, TContext, TValue> = Partial<
  Record<
    FormViewName | "default",
    FormRendererDescriptor<TRoot, TContext, TValue>
  >
>;

export type FormFieldOptionsSource<TRoot, TContext, TValue> =
  | InlineOptionPickerOption[]
  | ((
      args: Pick<
        FormFieldRenderArgs<TRoot, TContext, TValue>,
        "root" | "value" | "field" | "context"
      >,
    ) => InlineOptionPickerOption[]);

export type FormFieldStringSource<TRoot, TContext, TValue> =
  | string[]
  | ((
      args: Pick<
        FormFieldRenderArgs<TRoot, TContext, TValue>,
        "root" | "value" | "field" | "context"
      >,
    ) => string[]);

export type FormFieldReferenceIndexSource<TRoot, TContext, TValue> =
  | ReferenceIndex
  | ((
      args: Pick<
        FormFieldRenderArgs<TRoot, TContext, TValue>,
        "root" | "value" | "field" | "context"
      >,
    ) => ReferenceIndex);

export type FormFieldConfig<TRoot, TContext = undefined, TValue = unknown> = {
  id: string;
  label: string;
  kind: FormFieldKind;
  path?: string;
  description?: string;
  placeholder?: string;
  ariaLabel?: string;
  align?: FormFieldAlign;
  as?: FormFieldWrapper;
  inputType?: string;
  autocomplete?: HTMLInputAttributes["autocomplete"];
  presentation?: "menu" | "swap";
  rows?: number;
  readonly?: boolean;
  get: (root: TRoot, context: TContext) => TValue;
  set?: (root: TRoot, value: TValue, context: TContext) => TRoot;
  format?: (value: TValue, root: TRoot, context: TContext) => string;
  options?: FormFieldOptionsSource<TRoot, TContext, TValue>;
  suggestions?: FormFieldStringSource<TRoot, TContext, TValue>;
  referenceIndex?: FormFieldReferenceIndexSource<TRoot, TContext, TValue>;
  addLabel?: string;
  addHeading?: string;
  searchPlaceholder?: string;
  renderers?: FormRendererMap<TRoot, TContext, TValue>;
};

export type FormConfig<TRoot, TContext = undefined> = {
  id: string;
  fields: Array<FormFieldConfig<TRoot, TContext, any>>;
  defaultView?: FormViewName;
};

export type YamlBackedFormConfig<TRoot, TContext = undefined> = FormConfig<
  TRoot,
  TContext
> & {
  yamlLabel?: string;
};
