import type { Component } from "svelte";
import type {
  FormFieldKindOptions,
  FormFieldKindValue,
  RegisteredFormFieldKind,
} from "../core/path-config";
import type {
  FormFieldAlign,
  FormFieldConfig,
  FormFieldWrapper,
  FormValidationIssue,
  FormViewName,
} from "../core/types";
import RegisteredFieldControl from "./RegisteredFieldControl.svelte";

export type RegisteredFormRendererProps<
  TKind extends RegisteredFormFieldKind,
  TValues = unknown,
  TContext = undefined,
> = {
  root: TValues;
  value: FormFieldKindValue<TKind>;
  field: FormFieldConfig<TValues, TContext, FormFieldKindValue<TKind>> &
    FormFieldKindOptions<TKind> & { kind: TKind };
  view: FormViewName;
  context: TContext;
  issues: FormValidationIssue[];
  readonly: boolean;
  update: (value: FormFieldKindValue<TKind>) => void | Promise<void>;
  updateRoot: (value: TValues) => void | Promise<void>;
  blur?: () => void;
};

export type RegisteredFormRendererDescriptor<
  TKind extends RegisteredFormFieldKind = RegisteredFormFieldKind,
  TValues = unknown,
  TContext = undefined,
> = {
  component: Component<
    RegisteredFormRendererProps<TKind, TValues, TContext> &
      Record<string, unknown>
  >;
  wrapper?: "field" | "none";
  interactive?: boolean;
  align?: FormFieldAlign;
  as?: FormFieldWrapper;
  props?: Record<string, unknown>;
};

type ErasedRendererDescriptor = RegisteredFormRendererDescriptor<any, any, any>;

const BUILTIN_KINDS = [
  "text",
  "textarea",
  "date",
  "time",
  "readonly",
  "timestamp",
  "boolean",
  "options",
  "segmented",
  "choice",
  "string-list",
  "ordered-string-list",
  "tag-list",
  "chip-list",
  "reference-list",
  "custom",
] as const;

function builtinDescriptor(kind: (typeof BUILTIN_KINDS)[number]) {
  return {
    component: RegisteredFieldControl,
    wrapper:
      kind === "ordered-string-list" || kind === "reference-list"
        ? ("none" as const)
        : ("field" as const),
    interactive: true,
  } satisfies ErasedRendererDescriptor;
}

export class FormRendererRegistry {
  #renderers = new Map<string, ErasedRendererDescriptor>();

  constructor(options: { includeBuiltins?: boolean } = {}) {
    if (options.includeBuiltins !== false) {
      for (const kind of BUILTIN_KINDS) {
        this.#renderers.set(kind, builtinDescriptor(kind));
      }
    }
  }

  register<
    TKind extends RegisteredFormFieldKind,
    TValues = unknown,
    TContext = undefined,
  >(
    kind: TKind,
    descriptor: RegisteredFormRendererDescriptor<TKind, TValues, TContext>,
    options: { replace?: boolean } = {},
  ): () => void {
    if (this.#renderers.has(kind) && !options.replace) {
      throw new Error(
        `A form renderer for "${kind}" is already registered. Pass { replace: true } to override it.`,
      );
    }
    const previous = this.#renderers.get(kind);
    this.#renderers.set(kind, descriptor as ErasedRendererDescriptor);
    return () => {
      if (this.#renderers.get(kind) !== descriptor) return;
      if (previous) this.#renderers.set(kind, previous);
      else this.#renderers.delete(kind);
    };
  }

  resolve(kind: string): ErasedRendererDescriptor | null {
    return this.#renderers.get(kind) ?? null;
  }

  has(kind: string): boolean {
    return this.#renderers.has(kind);
  }
}

export function createFormRendererRegistry(): FormRendererRegistry {
  return new FormRendererRegistry();
}

export const defaultFormRendererRegistry = new FormRendererRegistry();
