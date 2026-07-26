import AppSettingsContent from "./AppSettingsContent.svelte";
import AppSettingsNavigation from "./AppSettingsNavigation.svelte";
import AppSettingsRoot from "./AppSettingsRoot.svelte";
import AppSettingsSearch from "./AppSettingsSearch.svelte";
import AppSettingsSection from "./AppSettingsSection.svelte";
import AppShellHotkeySettings from "./AppShellHotkeySettings.svelte";
import AppShellPluginsSettings from "./AppShellPluginsSettings.svelte";
import WorkspaceSettingField from "./WorkspaceSettingField.svelte";
import WorkspaceSettingList from "./WorkspaceSettingList.svelte";
import WorkspaceSettingsSurface from "./WorkspaceSettingsSurface.svelte";

export * from "./configuration.js";
export * from "./persistence.js";
export * from "./settings-controller.svelte.js";
export * from "./types.js";

export {
  AppSettingsContent,
  AppSettingsNavigation,
  AppSettingsRoot,
  AppSettingsSearch,
  AppSettingsSection,
  AppShellHotkeySettings,
  AppShellPluginsSettings,
  WorkspaceSettingField,
  WorkspaceSettingList,
  WorkspaceSettingsSurface,
};

export const AppSettings = {
  Root: AppSettingsRoot,
  Search: AppSettingsSearch,
  Navigation: AppSettingsNavigation,
  Content: AppSettingsContent,
  Section: AppSettingsSection,
  Item: WorkspaceSettingField,
} as const;
