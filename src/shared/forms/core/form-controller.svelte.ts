import { SvelteSet } from "svelte/reactivity";
import type {
  AnyPathFormFieldConfig,
  FormValidationMode,
  RuntimePathFormConfig,
} from "./path-config";
import type { FieldPath } from "./path-types";
import { getFormValueAtPath, setFormValueAtPath } from "./path-utils";
import type { FormValidationIssue } from "./types";

type FormControllerConnection<TValues, TContext> = {
  value: TValues;
  config: RuntimePathFormConfig<TValues, TContext>;
  context: TContext;
  onChange: (value: TValues) => void | Promise<void>;
};

export type FormFieldState = {
  isDirty: boolean;
  isTouched: boolean;
  isValidating: boolean;
  invalid: boolean;
  issues: FormValidationIssue[];
};

export type FormControllerResetOptions = {
  keepDirty?: boolean;
  keepTouched?: boolean;
  keepErrors?: boolean;
  emit?: boolean;
};

export type CreateFormControllerOptions<TValues> = {
  defaultValues: TValues;
  validationMode?: FormValidationMode;
};

function clone<TValue>(value: TValue): TValue {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value)) as TValue;
  }
}

function equal(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

function normalizeIssue(
  path: string,
  issue: string | FormValidationIssue | null | undefined,
): FormValidationIssue | null {
  if (!issue) return null;
  return typeof issue === "string" ? { path, message: issue } : issue;
}

/**
 * Reactive metadata controller for controlled config-driven forms. It never
 * persists values; the attached consumer remains authoritative.
 */
export class FormController<TValues, TContext = undefined> {
  readonly dirtyFields = new SvelteSet<FieldPath<TValues>>();
  readonly touchedFields = new SvelteSet<FieldPath<TValues>>();
  readonly validatingFields = new SvelteSet<FieldPath<TValues>>();
  issues = $state<FormValidationIssue[]>([]);
  validationMode = $state<FormValidationMode>("onSubmit");

  #baseline: TValues;
  #current: TValues;
  #connection: FormControllerConnection<TValues, TContext> | null = null;
  #fieldElements = new Map<string, HTMLElement>();
  #validationGeneration = new Map<string, number>();
  #closedDisclosures = new SvelteSet<string>();
  #knownDisclosures = new Map<string, string | undefined>();
  #disclosureRevision = $state(0);
  #itemIds = new Map<string, string[]>();
  #identitySequence = 0;

  constructor(options: CreateFormControllerOptions<TValues>) {
    this.#baseline = clone(options.defaultValues);
    this.#current = clone(options.defaultValues);
    this.validationMode = options.validationMode ?? "onSubmit";
  }

  get isDirty(): boolean {
    return this.dirtyFields.size > 0;
  }

  get isValidating(): boolean {
    return this.validatingFields.size > 0;
  }

  get isValid(): boolean {
    return !this.issues.some(
      (issue) => (issue.severity ?? "error") === "error",
    );
  }

  /** @internal Connect the current controlled value and config. */
  connect(connection: FormControllerConnection<TValues, TContext>): void {
    this.#connection = connection;
    this.#current = connection.value;
    this.validationMode =
      connection.config.validationMode ?? this.validationMode ?? "onSubmit";
    this.#refreshDirtyFields();
  }

  getFieldState(path: FieldPath<TValues>): FormFieldState {
    return {
      isDirty: this.dirtyFields.has(path),
      isTouched: this.touchedFields.has(path),
      isValidating: this.validatingFields.has(path),
      invalid: this.issues.some((issue) => issue.path === path),
      issues: this.issues.filter((issue) => issue.path === path),
    };
  }

  registerField(path: FieldPath<TValues>, element: HTMLElement | null): void {
    if (element) this.#fieldElements.set(path, element);
    else this.#fieldElements.delete(path);
  }

  focus(path: FieldPath<TValues>, options?: { select?: boolean }): boolean {
    const host = this.#fieldElements.get(path);
    const target = (
      host?.matches("input, textarea, button, [tabindex]")
        ? host
        : host?.querySelector<HTMLElement>(
            "input, textarea, button, [tabindex]:not([tabindex='-1'])",
          )
    ) as (HTMLElement & { select?: () => void }) | null;
    if (!target) return false;
    target.focus();
    if (options?.select) target.select?.();
    return true;
  }

  notifyChange(path: FieldPath<TValues>, nextValue: TValues): void {
    this.#current = nextValue;
    this.#setDirty(path);
    void this.#connection?.onChange(nextValue);

    if (
      this.validationMode === "onChange" ||
      this.validationMode === "all" ||
      (this.validationMode === "onTouched" && this.touchedFields.has(path))
    ) {
      void this.validate(path);
    }
    void this.#validateDependents(path);
  }

  notifyBlur(path: FieldPath<TValues>): void {
    this.touchedFields.add(path);
    if (
      this.validationMode === "onBlur" ||
      this.validationMode === "onTouched" ||
      this.validationMode === "all"
    ) {
      void this.validate(path);
    }
  }

  async validate(path?: FieldPath<TValues>): Promise<boolean> {
    const connection = this.#connection;
    if (!connection) return this.isValid;
    if (path) {
      await this.#validateField(path);
      return !this.issues.some(
        (issue) =>
          issue.path === path && (issue.severity ?? "error") === "error",
      );
    }

    const paths = Object.keys(connection.config.fields) as FieldPath<TValues>[];
    await Promise.all(paths.map((fieldPath) => this.#validateField(fieldPath)));
    if (connection.config.validate) {
      const formIssues =
        (await connection.config.validate(this.#current, connection.context)) ??
        [];
      this.issues = [
        ...this.issues.filter((issue) => issue.path !== undefined),
        ...formIssues,
      ];
    }
    return this.isValid;
  }

  reset(
    nextValues: TValues = clone(this.#baseline),
    options: FormControllerResetOptions = {},
  ): void {
    this.#baseline = clone(nextValues);
    this.#current = nextValues;
    if (!options.keepDirty) this.dirtyFields.clear();
    if (!options.keepTouched) this.touchedFields.clear();
    if (!options.keepErrors) this.issues = [];
    this.validatingFields.clear();
    this.#validationGeneration.clear();
    this.#closedDisclosures.clear();
    this.#disclosureRevision += 1;
    this.#itemIds.clear();
    if (options.emit !== false) void this.#connection?.onChange(nextValues);
  }

  resetField(
    path: FieldPath<TValues>,
    options: FormControllerResetOptions = {},
  ): void {
    const next = setFormValueAtPath(
      this.#current,
      path,
      clone(getFormValueAtPath(this.#baseline, path)),
    );
    this.#current = next;
    if (!options.keepDirty) this.dirtyFields.delete(path);
    if (!options.keepTouched) this.touchedFields.delete(path);
    if (!options.keepErrors) {
      this.issues = this.issues.filter((issue) => issue.path !== path);
    }
    void this.#connection?.onChange(next);
  }

  registerDisclosure(id: string, group?: string): void {
    if (this.#knownDisclosures.get(id) === group) return;
    this.#knownDisclosures.set(id, group);
    this.#disclosureRevision += 1;
  }

  isDisclosureOpen(id: string, defaultOpen = true): boolean {
    return defaultOpen ? !this.#closedDisclosures.has(id) : false;
  }

  toggleDisclosure(id: string, defaultOpen = true): void {
    if (this.isDisclosureOpen(id, defaultOpen)) {
      this.#closedDisclosures.add(id);
    } else {
      this.#closedDisclosures.delete(id);
    }
    this.#disclosureRevision += 1;
  }

  collapseAll(group?: string): void {
    for (const [id, disclosureGroup] of this.#knownDisclosures) {
      if (!group || disclosureGroup === group) this.#closedDisclosures.add(id);
    }
    this.#disclosureRevision += 1;
  }

  expandAll(group?: string): void {
    for (const [id, disclosureGroup] of this.#knownDisclosures) {
      if (!group || disclosureGroup === group)
        this.#closedDisclosures.delete(id);
    }
    this.#disclosureRevision += 1;
  }

  allDisclosuresCollapsed(group?: string): boolean {
    void this.#disclosureRevision;
    let matched = 0;
    for (const [id, disclosureGroup] of this.#knownDisclosures) {
      if (group && disclosureGroup !== group) continue;
      matched += 1;
      if (!this.#closedDisclosures.has(id)) return false;
    }
    return matched > 0;
  }

  itemIds<TItem>(
    path: string,
    items: readonly TItem[],
    getKey?: (item: TItem, index: number) => string,
  ): string[] {
    const previous = this.#itemIds.get(path) ?? [];
    const next = items.map((item, index) => {
      const configured = getKey?.(item, index);
      return configured
        ? `${path}:${configured}`
        : (previous[index] ?? this.#newId(path));
    });
    this.#itemIds.set(path, next);
    return next;
  }

  moveItemIdentity(path: string, index: number, direction: -1 | 1): void {
    const ids = [...(this.#itemIds.get(path) ?? [])];
    const target = index + direction;
    if (index < 0 || target < 0 || index >= ids.length || target >= ids.length)
      return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    this.#itemIds.set(path, ids);
    this.#moveArrayMetadata(path, index, target);
  }

  removeItemIdentity(path: string, index: number): void {
    const ids = [...(this.#itemIds.get(path) ?? [])];
    ids.splice(index, 1);
    this.#itemIds.set(path, ids);
    this.#removeArrayMetadata(path, index);
  }

  appendItemIdentity(path: string): void {
    this.#itemIds.set(path, [
      ...(this.#itemIds.get(path) ?? []),
      this.#newId(path),
    ]);
  }

  #newId(path: string): string {
    this.#identitySequence += 1;
    return `${path}:item-${this.#identitySequence}`;
  }

  #moveArrayMetadata(path: string, from: number, to: number): void {
    const fromPrefix = `${path}.${from}`;
    const toPrefix = `${path}.${to}`;
    const swap = (value: string): string => {
      if (value === fromPrefix || value.startsWith(`${fromPrefix}.`)) {
        return `${toPrefix}${value.slice(fromPrefix.length)}`;
      }
      if (value === toPrefix || value.startsWith(`${toPrefix}.`)) {
        return `${fromPrefix}${value.slice(toPrefix.length)}`;
      }
      return value;
    };
    this.#replacePaths(this.dirtyFields, swap);
    this.#replacePaths(this.touchedFields, swap);
    this.issues = this.issues.map((issue) =>
      issue.path ? { ...issue, path: swap(issue.path) } : issue,
    );
  }

  #removeArrayMetadata(path: string, index: number): void {
    const prefix = `${path}.`;
    const removedPrefix = `${prefix}${index}`;
    const shift = (value: string): string | null => {
      if (value === removedPrefix || value.startsWith(`${removedPrefix}.`)) {
        return null;
      }
      if (!value.startsWith(prefix)) return value;
      const remainder = value.slice(prefix.length);
      const [rawIndex, ...tail] = remainder.split(".");
      const itemIndex = Number.parseInt(rawIndex, 10);
      if (!Number.isInteger(itemIndex) || itemIndex <= index) return value;
      return `${prefix}${itemIndex - 1}${tail.length ? `.${tail.join(".")}` : ""}`;
    };
    this.#replacePaths(this.dirtyFields, shift);
    this.#replacePaths(this.touchedFields, shift);
    this.issues = this.issues.flatMap((issue) => {
      if (!issue.path) return [issue];
      const nextPath = shift(issue.path);
      return nextPath ? [{ ...issue, path: nextPath }] : [];
    });
  }

  #replacePaths(
    values: SvelteSet<FieldPath<TValues>>,
    replace: (value: string) => string | null,
  ): void {
    const next = [...values]
      .map((value) => replace(value))
      .filter((value): value is string => value !== null);
    values.clear();
    for (const value of next) values.add(value as FieldPath<TValues>);
  }

  #setDirty(path: FieldPath<TValues>): void {
    if (
      equal(
        getFormValueAtPath(this.#current, path),
        getFormValueAtPath(this.#baseline, path),
      )
    ) {
      this.dirtyFields.delete(path);
    } else {
      this.dirtyFields.add(path);
    }
  }

  #refreshDirtyFields(): void {
    const fields = this.#connection?.config.fields;
    if (!fields) return;
    for (const path of Object.keys(fields) as FieldPath<TValues>[]) {
      this.#setDirty(path);
    }
  }

  #field(path: FieldPath<TValues>): AnyPathFormFieldConfig | undefined {
    return this.#connection?.config.fields[path] as
      | AnyPathFormFieldConfig
      | undefined;
  }

  async #validateField(path: FieldPath<TValues>): Promise<void> {
    const field = this.#field(path);
    const connection = this.#connection;
    const validate = field?.validate;
    if (!connection || typeof validate !== "function") {
      this.issues = this.issues.filter((issue) => issue.path !== path);
      return;
    }

    const generation = (this.#validationGeneration.get(path) ?? 0) + 1;
    this.#validationGeneration.set(path, generation);
    this.validatingFields.add(path);
    const rawIssue = await validate(getFormValueAtPath(this.#current, path), {
      root: this.#current,
      context: connection.context,
      path,
    });
    if (this.#validationGeneration.get(path) !== generation) return;
    this.validatingFields.delete(path);
    const issue = normalizeIssue(
      path,
      rawIssue as string | FormValidationIssue | null | undefined,
    );
    this.issues = [
      ...this.issues.filter((item) => item.path !== path),
      ...(issue ? [issue] : []),
    ];
  }

  async #validateDependents(path: FieldPath<TValues>): Promise<void> {
    const fields = this.#connection?.config.fields;
    if (!fields) return;
    const dependents = Object.entries(fields)
      .filter(([, field]) =>
        (field as AnyPathFormFieldConfig | undefined)?.dependsOn?.includes(
          path,
        ),
      )
      .map(([fieldPath]) => fieldPath as FieldPath<TValues>);
    await Promise.all(
      dependents.map((fieldPath) => this.#validateField(fieldPath)),
    );
  }
}

export function createFormController<TValues, TContext = undefined>(
  options: CreateFormControllerOptions<TValues>,
): FormController<TValues, TContext> {
  return new FormController<TValues, TContext>(options);
}
