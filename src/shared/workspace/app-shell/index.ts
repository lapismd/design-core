import AppShellAboutDialog from "./AppShellAboutDialog.svelte";
import AppShellCommandPalette from "./AppShellCommandPalette.svelte";
import AppShellCorePluginsSettings from "./AppShellCorePluginsSettings.svelte";
import AppShellFloatingLayer from "./AppShellFloatingLayer.svelte";
import AppShellHotkeySettingsSurface from "./AppShellHotkeySettings.svelte";
import AppShellLeftSidebar from "./AppShellLeftSidebar.svelte";
import AppShellNotices from "./AppShellNotices.svelte";
import AppShellNoticeToasts from "./AppShellNoticeToasts.svelte";
import AppShellOverlayLayer from "./AppShellOverlayLayer.svelte";
import AppShellPluginLayer from "./AppShellPluginLayer.svelte";
import AppShellRibbon from "./AppShellRibbon.svelte";
import AppShellRightSidebar from "./AppShellRightSidebar.svelte";
import AppShellRoot from "./AppShellRoot.svelte";
import AppShellSettings from "./AppShellSettings.svelte";
import AppShellSidebar from "./AppShellSidebar.svelte";
import AppShellStatusBar from "./AppShellStatusBar.svelte";
import AppShellSurface from "./AppShellSurface.svelte";
import AppShellTabs from "./AppShellTabs.svelte";
import AppShellWorkspace from "./AppShellWorkspace.svelte";

export {
  AppShellAboutDialog,
  AppShellCommandPalette,
  AppShellCorePluginsSettings,
  AppShellFloatingLayer,
  AppShellHotkeySettingsSurface,
  AppShellLeftSidebar,
  AppShellNotices,
  AppShellNoticeToasts,
  AppShellOverlayLayer,
  AppShellPluginLayer,
  AppShellRibbon,
  AppShellRightSidebar,
  AppShellRoot,
  AppShellSettings,
  AppShellSidebar,
  AppShellStatusBar,
  AppShellSurface,
  AppShellTabs,
  AppShellWorkspace,
};

export const AppShell = {
  Root: AppShellRoot,
  About: AppShellAboutDialog,
  CommandPalette: AppShellCommandPalette,
  CorePluginsSettings: AppShellCorePluginsSettings,
  Ribbon: AppShellRibbon,
  HotkeySettings: AppShellHotkeySettingsSurface,
  LeftSidebar: AppShellLeftSidebar,
  Notices: AppShellNotices,
  OverlayLayer: AppShellOverlayLayer,
  PluginLayer: AppShellPluginLayer,
  Sidebar: AppShellSidebar,
  Tabs: AppShellTabs,
  Workspace: AppShellWorkspace,
  RightSidebar: AppShellRightSidebar,
  FloatingLayer: AppShellFloatingLayer,
  StatusBar: AppShellStatusBar,
  Settings: AppShellSettings,
  Surface: AppShellSurface,
} as const;
