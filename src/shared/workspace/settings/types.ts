import type { WorkspaceIconName } from "../core/types.js";
import type { AppShellController } from "../core/app-shell-controller.svelte.js";
import type { WorkspaceSettingsController } from "./settings-controller.svelte.js";
import type { Component } from "svelte";

export interface WorkspaceSettingOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

export interface WorkspaceSettingBase<Id extends string = string> {
  id: Id;
  title: string;
  description?: string;
  order?: number;
  disabled?: boolean;
  readOnly?: boolean;
  deprecated?: string;
}

export interface WorkspaceBooleanSetting extends WorkspaceSettingBase {
  type: "boolean";
  default: boolean;
}

export interface WorkspaceStringSetting extends WorkspaceSettingBase {
  type: "string";
  default: string;
  presentation?:
    | "text"
    | "textarea"
    | "color"
    | "email"
    | "url"
    | "ip"
    | "date"
    | "time"
    | "icon"
    | "combobox"
    | "password";
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  optionsSource?: string;
  optionsSourceParams?: Record<string, unknown>;
  allowUnknownOptions?: boolean;
}

export interface WorkspaceNumberSetting extends WorkspaceSettingBase {
  type: "number" | "integer";
  default: number;
  minimum?: number;
  maximum?: number;
  step?: number;
}

export interface WorkspaceEnumSetting extends WorkspaceSettingBase {
  type: "enum";
  default: string;
  options?: WorkspaceSettingOption[];
  optionsSource?: string;
  optionsSourceParams?: Record<string, unknown>;
  allowUnknownOptions?: boolean;
}

export interface WorkspaceMultiEnumSetting extends WorkspaceSettingBase {
  type: "multi-enum";
  default: string[];
  options?: WorkspaceSettingOption[];
  optionsSource?: string;
  optionsSourceParams?: Record<string, unknown>;
  allowUnknownOptions?: boolean;
  minimumItems?: number;
  maximumItems?: number;
}

export interface WorkspaceListSetting extends WorkspaceSettingBase {
  type: "list";
  default: Array<string | number | boolean>;
  itemType: "string" | "number" | "integer" | "boolean";
  itemLabels?: string[];
  minimumItems?: number;
  maximumItems?: number;
}

export interface WorkspaceActionSetting extends WorkspaceSettingBase {
  type: "action";
  label: string;
  icon?: WorkspaceIconName;
  variant?: "default" | "outline" | "destructive" | "ghost";
  isDisabled?(): boolean;
  isBusy?(): boolean;
  confirm?(): boolean | Promise<boolean>;
  run(): void | WorkspaceActionResult | Promise<void | WorkspaceActionResult>;
}

export interface WorkspaceActionResult {
  tone: "success" | "warning" | "error";
  message: string;
}

export interface WorkspaceOutputSetting extends WorkspaceSettingBase {
  type: "output";
  presentation?: "text" | "code" | "status" | "copyable";
  emptyLabel?: string;
  copyLabel?: string;
  leadingCharacters?: number;
  trailingCharacters?: number;
}

export interface WorkspaceSectionSettingGroup extends WorkspaceSettingBase {
  type: "group";
  presentation?: "section";
  fields: WorkspaceSettingField[];
}

/** A compact table presentation that preserves each Boolean child as a setting. */
export interface WorkspaceToggleTableSettingGroup extends WorkspaceSettingBase {
  type: "group";
  presentation: "toggle-table";
  fields: WorkspaceBooleanSetting[];
}

export type WorkspaceSettingGroup =
  | WorkspaceSectionSettingGroup
  | WorkspaceToggleTableSettingGroup;

export interface WorkspaceObjectProperty {
  id: string;
  title: string;
  type: "string" | "number" | "integer" | "boolean";
  default?: string | number | boolean;
  required?: boolean;
  presentation?: "text" | "url" | "code" | "copyable" | "status" | "hidden";
  readOnly?: boolean;
}

export interface WorkspaceObjectRowAction {
  id: string;
  label: string;
  icon?: WorkspaceIconName;
  variant?: "default" | "outline" | "destructive" | "ghost";
  disabled?: boolean | ((row: Record<string, unknown>) => boolean);
  hidden?: boolean | ((row: Record<string, unknown>) => boolean);
  busy?: (row: Record<string, unknown>) => boolean;
  confirm?: (row: Record<string, unknown>) => boolean | Promise<boolean>;
  run(
    row: Record<string, unknown>,
    index: number,
  ): void | WorkspaceActionResult | Promise<void | WorkspaceActionResult>;
}

export interface WorkspaceObjectCollectionSetting extends WorkspaceSettingBase {
  type: "object-array" | "object-grid";
  default: Array<Record<string, unknown>>;
  properties: WorkspaceObjectProperty[];
  minimumItems?: number;
  maximumItems?: number;
  rowKey?: string;
  reorderable?: boolean;
  allowAdd?: boolean;
  allowRemove?: boolean;
  addLabel?: string;
  rowActions?: WorkspaceObjectRowAction[];
}

export interface WorkspaceObjectMapSetting extends WorkspaceSettingBase {
  type: "object-map";
  default: Record<string, Record<string, unknown>>;
  properties: WorkspaceObjectProperty[];
}

export interface WorkspaceKeyValueSetting extends WorkspaceSettingBase {
  type: "key-value";
  default: Record<string, string>;
  keyLabel?: string;
  valueLabel?: string;
  addLabel?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  valueOptions?: WorkspaceSettingOption[];
  valueOptionsSource?: string;
  allowUnknownValues?: boolean;
}

export interface WorkspaceCustomSettingProps<T = unknown> {
  id: string;
  field: WorkspaceCustomSetting<T>;
  value: T;
  disabled?: boolean;
  readOnly?: boolean;
  busy?: boolean;
  error?: string;
  setValue(value: T): Promise<boolean>;
  /** @deprecated Use setValue for controlled custom fields. */
  update(value: T): boolean;
}

export interface WorkspaceCustomFieldAdapter<T = unknown> {
  id: string;
  component: Component<WorkspaceCustomSettingProps<T>>;
}

export interface WorkspaceCustomSetting<T = unknown>
  extends WorkspaceSettingBase {
  type: "custom";
  default?: T;
  adapter?: string;
  component?: Component<WorkspaceCustomSettingProps<T>>;
  presentation?: "row" | "full-width";
  validate?(value: T): string | null;
}

export interface WorkspaceUnsupportedSetting extends WorkspaceSettingBase {
  type: "unsupported";
  default?: unknown;
  schemaType?: string;
}

export type WorkspaceSettingField =
  | WorkspaceBooleanSetting
  | WorkspaceStringSetting
  | WorkspaceNumberSetting
  | WorkspaceEnumSetting
  | WorkspaceMultiEnumSetting
  | WorkspaceListSetting
  | WorkspaceActionSetting
  | WorkspaceOutputSetting
  | WorkspaceSettingGroup
  | WorkspaceObjectCollectionSetting
  | WorkspaceObjectMapSetting
  | WorkspaceKeyValueSetting
  | WorkspaceCustomSetting
  | WorkspaceUnsupportedSetting;

export interface WorkspaceSettingsPageProps {
  app?: AppShellController;
  controller: WorkspaceSettingsController;
  section: WorkspaceSettingsSection;
}

export interface WorkspaceSettingsSearchEntry {
  id: string;
  title: string;
  description?: string;
  keywords?: readonly string[];
  path?: readonly string[];
}

export interface WorkspaceSettingsSection {
  id: string;
  title: string;
  description?: string;
  icon?: WorkspaceIconName;
  order?: number;
  navigationGroupId?: string;
  sourcePluginId?: string;
  surface?: "schema" | "hotkeys" | "core-plugins";
  page?: Component<WorkspaceSettingsPageProps>;
  searchEntries?:
    | readonly WorkspaceSettingsSearchEntry[]
    | (() => readonly WorkspaceSettingsSearchEntry[]);
  revealSearchEntry?(entryId: string): void | Promise<void>;
  fields?: WorkspaceSettingField[];
}

export interface WorkspaceSettingsSource {
  get(fieldId: string): unknown;
  set(fieldId: string, value: unknown): Promise<unknown | void>;
  subscribe(listener: (fieldId?: string) => void): () => void;
}

export interface WorkspaceSettingsDefinition {
  section: WorkspaceSettingsSection;
  source: WorkspaceSettingsSource;
  adapters?: readonly WorkspaceCustomFieldAdapter<any>[];
}

export interface WorkspaceSettingsNavigationGroup {
  id: string;
  title: string;
  order?: number;
}

export interface WorkspaceSettingsSnapshotV1 {
  version: 1;
  values: Record<string, unknown>;
}

export interface WorkspaceSettingsChangeEvent {
  source: "update" | "source" | "restore-default" | "replace" | "load";
  id?: string;
}

export interface WorkspaceSettingsPersistence {
  load(): Promise<unknown | null>;
  save(
    snapshot: WorkspaceSettingsSnapshotV1,
    event: WorkspaceSettingsChangeEvent,
  ): Promise<void>;
}

export interface WorkspaceSettingsControllerOptions {
  sections?: WorkspaceSettingsSection[];
  navigationGroups?: WorkspaceSettingsNavigationGroup[];
  values?: Record<string, unknown>;
  persistence?: WorkspaceSettingsPersistence;
  saveDebounceMs?: number;
}

export interface WorkspaceSettingsValidationError {
  id: string;
  value: unknown;
  message: string;
}

export interface WorkspaceSettingsEventMap {
  ready: [];
  change: [event: WorkspaceSettingsChangeEvent];
  "schema-change": [];
  "validation-error": [event: WorkspaceSettingsValidationError];
  "persistence-error": [event: { operation: "load" | "save"; error: unknown }];
  "persistence-success": [event: { operation: "load" | "save" }];
  "source-error": [event: { id: string; error: unknown }];
}

export interface WorkspaceSettingsSearchResult {
  sectionId: string;
  fieldId: string | null;
  title: string;
  description?: string;
  path: string[];
  score: number;
}
