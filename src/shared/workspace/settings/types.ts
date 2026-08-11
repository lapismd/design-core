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
    | "combobox";
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
  minimumItems?: number;
  maximumItems?: number;
}

export interface WorkspaceActionSetting extends WorkspaceSettingBase {
  type: "action";
  label: string;
  icon?: WorkspaceIconName;
  variant?: "default" | "outline" | "destructive" | "ghost";
  run(): void | Promise<void>;
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
}

export interface WorkspaceObjectCollectionSetting extends WorkspaceSettingBase {
  type: "object-array" | "object-grid";
  default: Array<Record<string, unknown>>;
  properties: WorkspaceObjectProperty[];
  minimumItems?: number;
  maximumItems?: number;
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

export interface WorkspaceCustomSettingProps {
  id: string;
  value: unknown;
  disabled?: boolean;
  update(value: unknown): boolean;
}

export interface WorkspaceCustomSetting extends WorkspaceSettingBase {
  type: "custom";
  default: unknown;
  component: Component<WorkspaceCustomSettingProps>;
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
  fields?: WorkspaceSettingField[];
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
  source: "update" | "restore-default" | "replace" | "load";
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
}

export interface WorkspaceSettingsSearchResult {
  sectionId: string;
  fieldId: string | null;
  title: string;
  description?: string;
  path: string[];
  score: number;
}
