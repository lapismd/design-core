import {
  WorkspaceEventDispatcher,
  type WorkspaceEventRef,
} from "../core/event-dispatcher.js";
import type {
  WorkspaceActionSetting,
  WorkspaceSettingField,
  WorkspaceSettingGroup,
  WorkspaceSettingOption,
  WorkspaceSettingsChangeEvent,
  WorkspaceSettingsControllerOptions,
  WorkspaceSettingsEventMap,
  WorkspaceSettingsNavigationGroup,
  WorkspaceSettingsSearchResult,
  WorkspaceSettingsSearchEntry,
  WorkspaceSettingsSection,
  WorkspaceSettingsSnapshotV1,
} from "./types.js";

interface IndexedSetting {
  section: WorkspaceSettingsSection;
  field: Exclude<WorkspaceSettingField, WorkspaceSettingGroup>;
  path: string[];
}

function cloneValue<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch {
    return cloneConfigurationValue(value);
  }
}

function cloneConfigurationValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneConfigurationValue(entry)) as T;
  }
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return new Date(value) as T;

  const clone: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    clone[key] = cloneConfigurationValue(entry);
  }
  return clone as T;
}

function flattenFields(
  section: WorkspaceSettingsSection,
  fields = section.fields ?? [],
  path: string[] = [],
): IndexedSetting[] {
  const result: IndexedSetting[] = [];
  for (const field of fields) {
    if (field.type === "group") {
      result.push(
        ...flattenFields(section, field.fields, [...path, field.title]),
      );
    } else {
      result.push({ section, field, path: [...path, field.title] });
    }
  }
  return result;
}

function collectSettingGroups(
  fields: WorkspaceSettingField[],
  path: string[],
  visit: (group: WorkspaceSettingGroup, path: string[]) => void,
): void {
  for (const field of fields) {
    if (field.type !== "group") continue;
    const next = [...path, field.title];
    visit(field, next);
    collectSettingGroups(field.fields, next, visit);
  }
}

function sectionSearchEntries(
  section: WorkspaceSettingsSection,
): readonly WorkspaceSettingsSearchEntry[] {
  return typeof section.searchEntries === "function"
    ? section.searchEntries()
    : (section.searchEntries ?? []);
}

function defaultValues(
  sections: WorkspaceSettingsSection[],
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const section of sections) {
    for (const { field } of flattenFields(section)) {
      if (field.type !== "action" && field.type !== "unsupported") {
        values[field.id] = cloneValue(field.default);
      }
    }
  }
  return values;
}

function validateValue(
  field: Exclude<WorkspaceSettingField, WorkspaceSettingGroup>,
  value: unknown,
): string | null {
  if (field.type === "action") return "Actions do not store values";
  if (field.type === "boolean") {
    return typeof value === "boolean" ? null : "Expected a boolean value";
  }
  if (field.type === "string") {
    if (typeof value !== "string") return "Expected a string value";
    if (field.minLength !== undefined && value.length < field.minLength) {
      return `Must contain at least ${field.minLength} characters`;
    }
    if (field.maxLength !== undefined && value.length > field.maxLength) {
      return `Must contain no more than ${field.maxLength} characters`;
    }
    if (field.pattern && !new RegExp(field.pattern, "u").test(value)) {
      return "Value does not match the required pattern";
    }
    return null;
  }
  if (field.type === "number" || field.type === "integer") {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return "Expected a finite number";
    }
    if (field.type === "integer" && !Number.isInteger(value)) {
      return "Expected an integer";
    }
    if (field.minimum !== undefined && value < field.minimum) {
      return `Must be at least ${field.minimum}`;
    }
    if (field.maximum !== undefined && value > field.maximum) {
      return `Must be no more than ${field.maximum}`;
    }
    return null;
  }
  if (field.type === "enum") {
    if (typeof value !== "string") return "Expected a string value";
    if (
      field.allowUnknownOptions ||
      field.optionsSource ||
      !field.options?.length
    ) {
      return null;
    }
    return field.options.some((option) => option.value === value)
      ? null
      : "Choose one of the available options";
  }
  if (field.type === "multi-enum") {
    if (
      !Array.isArray(value) ||
      !value.every(
        (entry) =>
          typeof entry === "string" &&
          (field.allowUnknownOptions ||
            field.optionsSource ||
            !field.options?.length ||
            field.options.some((option) => option.value === entry)),
      )
    ) {
      return "Choose only available options";
    }
    if (field.minimumItems !== undefined && value.length < field.minimumItems) {
      return `Choose at least ${field.minimumItems} options`;
    }
    if (field.maximumItems !== undefined && value.length > field.maximumItems) {
      return `Choose no more than ${field.maximumItems} options`;
    }
    return null;
  }
  if (field.type === "object-array" || field.type === "object-grid") {
    if (!Array.isArray(value)) return "Expected a list of objects";
    if (
      !value.every(
        (entry) =>
          entry !== null && typeof entry === "object" && !Array.isArray(entry),
      )
    ) {
      return "Every item must be an object";
    }
    if (field.minimumItems !== undefined && value.length < field.minimumItems) {
      return `Add at least ${field.minimumItems} items`;
    }
    if (field.maximumItems !== undefined && value.length > field.maximumItems) {
      return `Add no more than ${field.maximumItems} items`;
    }
    return null;
  }
  if (field.type === "object-map") {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return "Expected a keyed object map";
    }
    return Object.values(value).every(
      (entry) =>
        entry !== null && typeof entry === "object" && !Array.isArray(entry),
    )
      ? null
      : "Every map value must be an object";
  }
  if (field.type === "key-value") {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return "Expected a keyed string map";
    }
    return Object.entries(value).every(
      ([key, entry]) => key.trim().length > 0 && typeof entry === "string",
    )
      ? null
      : "Every key and value must be a string";
  }
  if (field.type === "custom") return null;
  if (field.type === "unsupported") return null;
  if (field.type !== "list") return "Unsupported setting value";
  if (!Array.isArray(value)) return "Expected a list";
  if (field.minimumItems !== undefined && value.length < field.minimumItems) {
    return `Add at least ${field.minimumItems} items`;
  }
  if (field.maximumItems !== undefined && value.length > field.maximumItems) {
    return `Add no more than ${field.maximumItems} items`;
  }
  if (
    !value.every((entry) =>
      field.itemType === "integer"
        ? typeof entry === "number" && Number.isInteger(entry)
        : typeof entry === field.itemType,
    )
  ) {
    return `Every item must be a ${field.itemType}`;
  }
  return null;
}

export class WorkspaceSettingsController {
  sections = $state<WorkspaceSettingsSection[]>([]);
  navigationGroups = $state<WorkspaceSettingsNavigationGroup[]>([]);
  values = $state<Record<string, unknown>>({});
  ready = $state(false);
  dirty = $state(false);
  saving = $state(false);
  validationErrors = $state<Record<string, string>>({});
  selectedSectionId = $state("");
  dialogOpen = $state(false);
  revealFieldId = $state<string | null>(null);

  readonly #events = new WorkspaceEventDispatcher<WorkspaceSettingsEventMap>();
  readonly #persistence;
  readonly #saveDebounceMs: number;
  #saveTimer: ReturnType<typeof setTimeout> | null = null;
  #pendingSaveEvent: WorkspaceSettingsChangeEvent | null = null;
  #saveChain: Promise<void> = Promise.resolve();
  #hydrating = false;
  #optionSourceLoader?: (
    sourceId: string,
    context: {
      settingId: string;
      params?: Record<string, unknown>;
      query?: string;
    },
  ) => WorkspaceSettingOption[] | Promise<WorkspaceSettingOption[]>;

  constructor(options: WorkspaceSettingsControllerOptions = {}) {
    this.sections = [...(options.sections ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    this.navigationGroups = [...(options.navigationGroups ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    this.values = {
      ...defaultValues(this.sections),
      ...(options.values ?? {}),
    };
    this.#persistence = options.persistence;
    this.#saveDebounceMs = Math.max(0, options.saveDebounceMs ?? 400);
    this.#validateAll();
    this.selectedSectionId = this.sections[0]?.id ?? "";
    if (!this.#persistence) {
      this.ready = true;
      queueMicrotask(() => this.#events.trigger("ready"));
    }
  }

  on<Name extends keyof WorkspaceSettingsEventMap>(
    name: Name,
    listener: (...args: WorkspaceSettingsEventMap[Name]) => void,
  ): WorkspaceEventRef<WorkspaceSettingsEventMap, Name> {
    return this.#events.on(name, listener);
  }

  offref<Name extends keyof WorkspaceSettingsEventMap>(
    ref: WorkspaceEventRef<WorkspaceSettingsEventMap, Name>,
  ): void {
    this.#events.offref(ref);
  }

  registerSection(section: WorkspaceSettingsSection): () => void {
    this.sections = [
      ...this.sections.filter((candidate) => candidate.id !== section.id),
      section,
    ].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const defaults = defaultValues([section]);
    for (const [id, value] of Object.entries(defaults)) {
      if (!(id in this.values)) this.values[id] = value;
    }
    this.#validateAll();
    if (!this.selectedSectionId) this.selectedSectionId = section.id;
    this.#events.trigger("schema-change");
    return () => this.unregisterSection(section.id);
  }

  registerNavigationGroup(group: WorkspaceSettingsNavigationGroup): () => void {
    if (this.navigationGroups.some((candidate) => candidate.id === group.id)) {
      throw new Error(
        `A settings navigation group is already registered for "${group.id}"`,
      );
    }
    this.navigationGroups = [...this.navigationGroups, group].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    this.#events.trigger("schema-change");
    return () => {
      this.navigationGroups = this.navigationGroups.filter(
        (candidate) => candidate !== group,
      );
      this.#events.trigger("schema-change");
    };
  }

  setOptionSourceLoader(
    loader:
      | ((
          sourceId: string,
          context: {
            settingId: string;
            params?: Record<string, unknown>;
            query?: string;
          },
        ) => WorkspaceSettingOption[] | Promise<WorkspaceSettingOption[]>)
      | undefined,
  ): void {
    this.#optionSourceLoader = loader;
  }

  async loadOptions(
    sourceId: string,
    context: {
      settingId: string;
      params?: Record<string, unknown>;
      query?: string;
    },
  ): Promise<WorkspaceSettingOption[]> {
    return (await this.#optionSourceLoader?.(sourceId, context)) ?? [];
  }

  unregisterSection(sectionId: string): void {
    const next = this.sections.filter((section) => section.id !== sectionId);
    if (next.length === this.sections.length) return;
    this.sections = next;
    if (this.selectedSectionId === sectionId) {
      this.selectedSectionId = next[0]?.id ?? "";
    }
    this.#validateAll();
    this.#events.trigger("schema-change");
  }

  get<T = unknown>(id: string): T | undefined {
    return this.values[id] as T | undefined;
  }

  selectSection(sectionId: string): boolean {
    if (!this.sections.some((section) => section.id === sectionId)) {
      return false;
    }
    this.selectedSectionId = sectionId;
    return true;
  }

  open(options: { sectionId?: string; fieldId?: string } = {}): boolean {
    if (options.fieldId) {
      const indexed = this.#field(options.fieldId);
      if (indexed) {
        this.selectedSectionId = indexed.section.id;
        this.revealFieldId = options.fieldId;
      } else {
        const section = options.sectionId
          ? this.sections.find(
              (candidate) => candidate.id === options.sectionId,
            )
          : this.sections.find((candidate) =>
              sectionSearchEntries(candidate).some(
                (entry) => entry.id === options.fieldId,
              ),
            );
        if (
          !section ||
          !sectionSearchEntries(section).some(
            (entry) => entry.id === options.fieldId,
          )
        ) {
          return false;
        }
        this.selectedSectionId = section.id;
        this.revealFieldId = options.fieldId;
      }
    } else if (options.sectionId && !this.selectSection(options.sectionId)) {
      return false;
    } else {
      this.revealFieldId = null;
    }
    this.dialogOpen = true;
    return true;
  }

  close(): void {
    this.dialogOpen = false;
    this.revealFieldId = null;
  }

  listPaletteEntries(query: string): WorkspaceSettingsSearchResult[] {
    const normalized = query.trim();
    if (normalized) return this.search(normalized);
    const results: WorkspaceSettingsSearchResult[] = [];
    for (const section of this.sections) {
      results.push({
        sectionId: section.id,
        fieldId: null,
        title: section.title,
        description: section.description,
        path: [section.title],
        score: 0,
      });
      collectSettingGroups(
        section.fields ?? [],
        [section.title],
        (group, path) => {
          results.push({
            sectionId: section.id,
            fieldId: null,
            title: group.title,
            description: group.description,
            path,
            score: 1,
          });
        },
      );
    }
    return results;
  }

  update(id: string, value: unknown): boolean {
    const indexed = this.#field(id);
    if (!indexed || indexed.field.type === "action" || indexed.field.disabled) {
      return false;
    }
    const error = validateValue(indexed.field, value);
    if (error) {
      this.validationErrors[id] = error;
      this.#events.trigger("validation-error", { id, value, message: error });
      return false;
    }
    delete this.validationErrors[id];
    this.values[id] = cloneValue(value);
    this.#changed({ source: "update", id });
    return true;
  }

  restoreDefault(id: string): boolean {
    const indexed = this.#field(id);
    if (!indexed || indexed.field.type === "action") return false;
    delete this.validationErrors[id];
    this.values[id] = cloneValue(indexed.field.default);
    this.#changed({ source: "restore-default", id });
    return true;
  }

  async runAction(id: string): Promise<boolean> {
    const indexed = this.#field(id);
    if (!indexed || indexed.field.type !== "action" || indexed.field.disabled) {
      return false;
    }
    await (indexed.field as WorkspaceActionSetting).run();
    return true;
  }

  getSnapshot(): WorkspaceSettingsSnapshotV1 {
    return { version: 1, values: cloneValue(this.values) };
  }

  changeSnapshot(value: unknown): void {
    const record =
      typeof value === "object" && value !== null
        ? (value as Partial<WorkspaceSettingsSnapshotV1>)
        : {};
    const incoming =
      record.version === 1 &&
      typeof record.values === "object" &&
      record.values !== null
        ? record.values
        : {};
    this.values = { ...defaultValues(this.sections) };
    for (const [id, candidate] of Object.entries(incoming)) {
      const indexed = this.#field(id);
      if (
        indexed &&
        indexed.field.type !== "action" &&
        validateValue(indexed.field, candidate) === null
      ) {
        this.values[id] = cloneValue(candidate);
      }
    }
    this.#validateAll();
    this.#changed({ source: "replace" });
  }

  async load(): Promise<void> {
    if (this.ready) return;
    this.#hydrating = true;
    try {
      const value = await this.#persistence?.load();
      if (value !== null && value !== undefined) {
        const record = value as Partial<WorkspaceSettingsSnapshotV1>;
        if (record.version === 1 && record.values) {
          this.values = { ...defaultValues(this.sections) };
          for (const [id, candidate] of Object.entries(record.values)) {
            const indexed = this.#field(id);
            if (
              indexed &&
              indexed.field.type !== "action" &&
              validateValue(indexed.field, candidate) === null
            ) {
              this.values[id] = cloneValue(candidate);
            }
          }
        }
      }
      if (this.#persistence) {
        this.#events.trigger("persistence-success", { operation: "load" });
      }
      this.#validateAll();
    } catch (error) {
      this.#events.trigger("persistence-error", { operation: "load", error });
    } finally {
      this.#hydrating = false;
      this.ready = true;
      this.dirty = false;
      this.#events.trigger("ready");
    }
  }

  requestSave(event: WorkspaceSettingsChangeEvent): void {
    if (!this.#persistence || this.#hydrating) return;
    this.#pendingSaveEvent = event;
    if (this.#saveTimer) clearTimeout(this.#saveTimer);
    this.#saveTimer = setTimeout(() => {
      this.#saveTimer = null;
      void this.flushSave();
    }, this.#saveDebounceMs);
  }

  async flushSave(): Promise<void> {
    if (this.#saveTimer) {
      clearTimeout(this.#saveTimer);
      this.#saveTimer = null;
    }
    const event = this.#pendingSaveEvent;
    this.#pendingSaveEvent = null;
    if (!event || !this.#persistence) return this.#saveChain;
    const snapshot = this.getSnapshot();
    this.saving = true;
    this.#saveChain = this.#saveChain.then(async () => {
      try {
        await this.#persistence?.save(snapshot, event);
        this.dirty = false;
        this.#events.trigger("persistence-success", { operation: "save" });
      } catch (error) {
        this.#events.trigger("persistence-error", { operation: "save", error });
      } finally {
        this.saving = false;
      }
    });
    return this.#saveChain;
  }

  search(query: string): WorkspaceSettingsSearchResult[] {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return [];
    const results: WorkspaceSettingsSearchResult[] = [];
    for (const section of this.sections) {
      const sectionText =
        `${section.title} ${section.description ?? ""}`.toLocaleLowerCase();
      if (sectionText.includes(normalized)) {
        results.push({
          sectionId: section.id,
          fieldId: null,
          title: section.title,
          description: section.description,
          path: [section.title],
          score: sectionText.startsWith(normalized) ? 0 : 2,
        });
      }
      for (const indexed of flattenFields(section)) {
        const text =
          `${indexed.field.title} ${indexed.field.description ?? ""} ${indexed.path.join(" ")}`.toLocaleLowerCase();
        if (!text.includes(normalized)) continue;
        results.push({
          sectionId: section.id,
          fieldId: indexed.field.id,
          title: indexed.field.title,
          description: indexed.field.description,
          path: [section.title, ...indexed.path],
          score: text.startsWith(normalized) ? 0 : 1,
        });
      }
      for (const entry of sectionSearchEntries(section)) {
        const path = [section.title, ...(entry.path ?? [entry.title])];
        const text =
          `${entry.title} ${entry.description ?? ""} ${entry.keywords?.join(" ") ?? ""} ${path.join(" ")}`.toLocaleLowerCase();
        if (!text.includes(normalized)) continue;
        results.push({
          sectionId: section.id,
          fieldId: entry.id,
          title: entry.title,
          description: entry.description,
          path,
          score: text.startsWith(normalized) ? 0 : 1,
        });
      }
    }
    return results.sort(
      (a, b) => a.score - b.score || a.title.localeCompare(b.title),
    );
  }

  destroy(): void {
    if (this.#saveTimer) clearTimeout(this.#saveTimer);
    this.close();
    this.#events.clear();
  }

  #changed(event: WorkspaceSettingsChangeEvent): void {
    this.dirty = true;
    this.#events.trigger("change", event);
    this.requestSave(event);
  }

  #field(id: string): IndexedSetting | null {
    for (const section of this.sections) {
      const match = flattenFields(section).find(
        (entry) => entry.field.id === id,
      );
      if (match) return match;
    }
    return null;
  }

  #validateAll(): void {
    const next: Record<string, string> = {};
    for (const section of this.sections) {
      for (const { field } of flattenFields(section)) {
        if (field.type === "action") continue;
        const error = validateValue(field, this.values[field.id]);
        if (error) {
          this.values[field.id] = cloneValue(field.default);
        }
      }
    }
    this.validationErrors = next;
  }
}
