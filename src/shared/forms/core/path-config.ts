import type { HTMLInputAttributes } from "svelte/elements";
import type { InlineOptionPickerOption } from "../inline-option-picker/InlineOptionPicker.svelte";
import type { ReferenceIndex } from "./reference-utils";
import type {
  FormFieldAlign,
  FormFieldWrapper,
  FormRendererMap,
  FormValidationIssue,
  FormViewName,
} from "./types";
import type { FieldPath, FieldPathByValue, FieldPathValue } from "./path-types";

export type FormValidationMode =
  | "onSubmit"
  | "onBlur"
  | "onChange"
  | "onTouched"
  | "all";

/** Type-only definition used by the augmentable `FormFieldKindMap`. */
export interface FormFieldKindDefinition<TValue, TOptions = object> {
  readonly __value?: TValue;
  readonly __options?: TOptions;
}

export interface FormFieldKindMap {
  text: FormFieldKindDefinition<string>;
  textarea: FormFieldKindDefinition<string>;
  date: FormFieldKindDefinition<string>;
  time: FormFieldKindDefinition<string>;
  readonly: FormFieldKindDefinition<unknown>;
  timestamp: FormFieldKindDefinition<string>;
  boolean: FormFieldKindDefinition<boolean>;
  options: FormFieldKindDefinition<string>;
  segmented: FormFieldKindDefinition<string>;
  choice: FormFieldKindDefinition<string>;
  "string-list": FormFieldKindDefinition<string[]>;
  "ordered-string-list": FormFieldKindDefinition<string[]>;
  "tag-list": FormFieldKindDefinition<string[]>;
  "chip-list": FormFieldKindDefinition<string[]>;
  "reference-list": FormFieldKindDefinition<string[]>;
  custom: FormFieldKindDefinition<unknown>;
}

export type RegisteredFormFieldKind = keyof FormFieldKindMap & string;
type IsAny<TValue> = 0 extends 1 & TValue ? true : false;
export type FormFieldKindValue<TKey extends RegisteredFormFieldKind> =
  FormFieldKindMap[TKey] extends FormFieldKindDefinition<infer TValue, object>
    ? TValue
    : never;
export type FormFieldKindOptions<TKey extends RegisteredFormFieldKind> =
  FormFieldKindMap[TKey] extends FormFieldKindDefinition<
    unknown,
    infer TOptions
  >
    ? TOptions
    : object;

export type CompatibleFormFieldKind<TValue> = {
  [TKey in RegisteredFormFieldKind]: [NonNullable<TValue>] extends [
    FormFieldKindValue<TKey>,
  ]
    ? TKey
    : never;
}[RegisteredFormFieldKind];

export type PathFieldValidationArgs<
  TValues,
  TContext,
  TPath extends FieldPath<TValues>,
> = {
  root: TValues;
  context: TContext;
  path: TPath;
};

export type PathFieldValidator<
  TValues,
  TContext,
  TPath extends FieldPath<TValues>,
> = (
  value: FieldPathValue<TValues, TPath>,
  args: PathFieldValidationArgs<TValues, TContext, TPath>,
) =>
  | string
  | FormValidationIssue
  | null
  | undefined
  | Promise<string | FormValidationIssue | null | undefined>;

type PathFieldBase<
  TValues,
  TContext,
  TPath extends FieldPath<TValues>,
  TGroup extends string,
> = {
  id?: string;
  label?: string;
  group?: TGroup;
  description?: string;
  placeholder?: string;
  ariaLabel?: string;
  align?: FormFieldAlign;
  as?: FormFieldWrapper;
  inputType?: string;
  autocomplete?: HTMLInputAttributes["autocomplete"];
  rows?: number;
  readonly?: boolean;
  defaultValue?: FieldPathValue<TValues, TPath>;
  materializeDefaultFrom?: FieldPath<TValues>;
  validate?: PathFieldValidator<TValues, TContext, TPath>;
  dependsOn?: FieldPath<TValues>[];
  options?:
    | InlineOptionPickerOption[]
    | ((args: {
        root: TValues;
        value: FieldPathValue<TValues, TPath>;
        context: TContext;
      }) => InlineOptionPickerOption[]);
  suggestions?:
    | string[]
    | ((args: {
        root: TValues;
        value: FieldPathValue<TValues, TPath>;
        context: TContext;
      }) => string[]);
  referenceIndex?:
    | ReferenceIndex
    | ((args: {
        root: TValues;
        value: FieldPathValue<TValues, TPath>;
        context: TContext;
      }) => ReferenceIndex);
  addLabel?: string;
  addHeading?: string;
  searchPlaceholder?: string;
  renderers?: FormRendererMap<
    TValues,
    TContext,
    FieldPathValue<TValues, TPath>
  >;
};

type LeafPathFormFieldConfig<
  TValues,
  TContext,
  TPath extends FieldPath<TValues>,
  TGroup extends string,
> = {
  [TKind in CompatibleFormFieldKind<
    FieldPathValue<TValues, TPath>
  >]: PathFieldBase<TValues, TContext, TPath, TGroup> &
    FormFieldKindOptions<TKind> & {
      kind: TKind;
      presentation?: "menu" | "swap";
    };
}[CompatibleFormFieldKind<FieldPathValue<TValues, TPath>>];

type FormArrayItem<TValue> =
  NonNullable<TValue> extends readonly (infer TItem)[] ? TItem : never;

export type FormArrayItemTitle<TItem> =
  | (TItem extends object
      ? FieldPathByValue<TItem, string | undefined | null>
      : never)
  | ((args: { item: TItem; index: number }) => string);

type PrimitiveArrayItemField<TItem> = {
  [TKind in CompatibleFormFieldKind<TItem>]: FormFieldKindOptions<TKind> & {
    kind: TKind;
    label?: string;
    placeholder?: string;
    rows?: number;
    ariaLabel?: string;
    hideLabel?: boolean;
  };
}[CompatibleFormFieldKind<TItem>];

export type FormArrayPresentation = "rows" | "sections";
export type FormArrayAppearance = "default" | "subsection";
export type FormAddButtonPresentation = "inline" | "panel";

type ArrayPathFormFieldConfig<
  TValues,
  TContext,
  TPath extends FieldPath<TValues>,
  TGroup extends string,
  TItem = FormArrayItem<FieldPathValue<TValues, TPath>>,
> =
  NonNullable<FieldPathValue<TValues, TPath>> extends readonly unknown[]
    ? PathFieldBase<TValues, TContext, TPath, TGroup> & {
        kind: "array";
        presentation?: FormArrayPresentation;
        appearance?: FormArrayAppearance;
        createItem: () => TItem;
        itemConfig?: TItem extends object
          ? PathFormConfig<TItem, TContext, string>
          : never;
        itemField?: TItem extends object
          ? never
          : PrimitiveArrayItemField<TItem>;
        itemTitle?: FormArrayItemTitle<TItem>;
        editableTitlePath?: TItem extends object
          ? FieldPathByValue<TItem, string | undefined | null>
          : never;
        getKey?: (item: TItem, index: number) => string;
        marker?: (args: {
          item: TItem;
          index: number;
          total: number;
        }) => string | null;
        showLabel?: boolean;
        hideItemLabels?: boolean;
        addPlacement?: "header" | "footer";
        addButtonPresentation?: FormAddButtonPresentation;
        testId?: string;
        itemTestId?: (args: { item: TItem; index: number }) => string;
        collapsible?: boolean;
        movable?: boolean;
        removable?: boolean;
      }
    : never;

type DiscriminatorKey<TItem> = TItem extends unknown
  ? {
      [TKey in keyof TItem & string]: NonNullable<TItem[TKey]> extends string
        ? TKey
        : never;
    }[keyof TItem & string]
  : never;

type DiscriminatorValue<TItem, TKey extends PropertyKey> = TItem extends unknown
  ? TKey extends keyof TItem
    ? NonNullable<TItem[TKey]> & string
    : never
  : never;

type VariantItem<
  TItem,
  TDiscriminator extends PropertyKey,
  TValue extends string,
> = Extract<TItem, Record<TDiscriminator, TValue>>;

type VariantPathFormFieldConfig<
  TValues,
  TContext,
  TPath extends FieldPath<TValues>,
  TGroup extends string,
  TItem = FormArrayItem<FieldPathValue<TValues, TPath>>,
> =
  NonNullable<FieldPathValue<TValues, TPath>> extends readonly unknown[]
    ? {
        [TDiscriminator in DiscriminatorKey<TItem>]: PathFieldBase<
          TValues,
          TContext,
          TPath,
          TGroup
        > & {
          kind: "variant-array";
          discriminator: TDiscriminator;
          presentation?: FormArrayPresentation;
          appearance?: FormArrayAppearance;
          getKey?: (item: TItem, index: number) => string;
          itemTitle?: FormArrayItemTitle<TItem>;
          editableTitlePath?: TItem extends object
            ? FieldPathByValue<TItem, string | undefined | null>
            : never;
          collapsible?: boolean;
          movable?: boolean;
          removable?: boolean;
          addLabel?: string;
          addButtonPresentation?: FormAddButtonPresentation;
          chooserTitle?: string;
          showLabel?: boolean;
          testId?: string;
          itemTestId?: (args: { item: TItem; index: number }) => string;
          variants: {
            [TValue in DiscriminatorValue<TItem, TDiscriminator>]: {
              label: string;
              addLabel?: string;
              createItem: () => VariantItem<TItem, TDiscriminator, TValue>;
              itemConfig: PathFormConfig<
                VariantItem<TItem, TDiscriminator, TValue>,
                TContext,
                string
              >;
            };
          };
        };
      }[DiscriminatorKey<TItem>]
    : never;

export type PathFormFieldConfig<
  TValues,
  TPath extends FieldPath<TValues>,
  TContext = undefined,
  TGroup extends string = string,
> =
  IsAny<FieldPathValue<TValues, TPath>> extends true
    ? PathFieldBase<TValues, TContext, TPath, TGroup> & {
        kind: RegisteredFormFieldKind | "array" | "variant-array";
      }
    :
        | LeafPathFormFieldConfig<TValues, TContext, TPath, TGroup>
        | ArrayPathFormFieldConfig<TValues, TContext, TPath, TGroup>
        | VariantPathFormFieldConfig<TValues, TContext, TPath, TGroup>;

export type FormFieldConfigMap<
  TValues,
  TContext = undefined,
  TGroup extends string = string,
> = Partial<Record<FieldPath<TValues>, unknown>> & {
  readonly __formContext?: TContext;
  readonly __formGroup?: TGroup;
};

export type FormGroupConfig = {
  title: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  hiddenHeader?: boolean;
  appearance?: "default" | "subtle";
};

export type PathFormLayout = "grid" | "stacked";

export type PathFormConfig<
  TValues,
  TContext = undefined,
  TGroup extends string = string,
> = {
  id: string;
  fields: FormFieldConfigMap<TValues, TContext, TGroup>;
  groups?: Record<TGroup, FormGroupConfig>;
  defaults?: Partial<TValues>;
  layout?: PathFormLayout;
  defaultView?: FormViewName;
  validationMode?: FormValidationMode;
  validate?: (
    value: TValues,
    context: TContext,
  ) =>
    | FormValidationIssue[]
    | Promise<FormValidationIssue[]>
    | null
    | undefined;
};

type ValidatedFormFieldConfigMap<
  TValues,
  TContext,
  TGroup extends string,
  TFields extends Record<string, unknown>,
> = {
  [TPath in keyof TFields]: TPath extends FieldPath<TValues>
    ? TFields[TPath] & PathFormFieldConfig<TValues, TPath, TContext, TGroup>
    : never;
};

/** Erased renderer boundary; consumers should create values with `defineFormConfig`. */
export type RuntimePathFormConfig<TValues, TContext = undefined> = {
  id: string;
  fields: Record<string, AnyPathFormFieldConfig | undefined>;
  groups?: Record<string, FormGroupConfig>;
  defaults?: Partial<TValues>;
  layout?: PathFormLayout;
  defaultView?: FormViewName;
  validationMode?: FormValidationMode;
  validate?: (
    value: TValues,
    context: TContext,
  ) =>
    | FormValidationIssue[]
    | Promise<FormValidationIssue[]>
    | null
    | undefined;
};

/** Defines a path-keyed form while retaining exact field and group inference. */
export function defineFormConfig<TValues, TContext = undefined>() {
  return <
    const TGroups extends Record<string, FormGroupConfig> = Record<
      never,
      never
    >,
    const TFields extends Record<string, unknown> = Record<never, never>,
  >(
    config: Omit<
      PathFormConfig<TValues, TContext, keyof TGroups & string>,
      "fields" | "groups"
    > & {
      groups?: TGroups;
      fields: TFields &
        ValidatedFormFieldConfigMap<
          TValues,
          TContext,
          keyof TGroups & string,
          TFields
        >;
    },
  ) => config;
}

export function isPathFormConfig<TValues, TContext>(
  config:
    | RuntimePathFormConfig<TValues, TContext>
    | { fields: readonly unknown[] },
): config is RuntimePathFormConfig<TValues, TContext> {
  return !Array.isArray(config.fields);
}

export type AnyPathFormConfig = RuntimePathFormConfig<unknown, unknown>;
export type AnyPathFormFieldConfig = Record<string, unknown> & {
  kind: string;
  id?: string;
  label?: string;
  group?: string;
  validate?: (...args: any[]) => unknown;
  dependsOn?: string[];
};
