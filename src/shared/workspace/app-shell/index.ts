import AppShellAboutDialog from "./AppShellAboutDialog.svelte";
import AppShellBottomPanel from "./AppShellBottomPanel.svelte";
import AppShellDesktopLayout from "./AppShellDesktopLayout.svelte";
import AppShellCommandPalette from "./AppShellCommandPalette.svelte";
import AppShellCorePluginsSettings from "./AppShellCorePluginsSettings.svelte";
import AppShellFloatingLayer from "./AppShellFloatingLayer.svelte";
import AppShellHotkeySettingsSurface from "./AppShellHotkeySettings.svelte";
import AppShellLeftSidebar from "./AppShellLeftSidebar.svelte";
import AppShellMain from "./AppShellMain.svelte";
import AppShellNotices from "./AppShellNotices.svelte";
import AppShellNoticeToasts from "./AppShellNoticeToasts.svelte";
import AppShellOverlayLayer from "./AppShellOverlayLayer.svelte";
import AppShellPluginLayer from "./AppShellPluginLayer.svelte";
import AppShellRibbon from "./AppShellRibbon.svelte";
import AppShellRightSidebar from "./AppShellRightSidebar.svelte";
import AppShellRoot from "./AppShellRoot.svelte";
import AppShellSettings from "./AppShellSettings.svelte";
import AppShellSettingsDialog from "./AppShellSettingsDialog.svelte";
import AppShellSidebar from "./AppShellSidebar.svelte";
import AppShellStatusBar from "./AppShellStatusBar.svelte";
import AppShellSurface from "./AppShellSurface.svelte";
import AppShellTabs from "./AppShellTabs.svelte";
import AppShellWorkspace from "./AppShellWorkspace.svelte";

export {
  AppShellAboutDialog,
  AppShellBottomPanel,
  AppShellDesktopLayout,
  AppShellCommandPalette,
  AppShellCorePluginsSettings,
  AppShellFloatingLayer,
  AppShellHotkeySettingsSurface,
  AppShellLeftSidebar,
  AppShellMain,
  AppShellNotices,
  AppShellNoticeToasts,
  AppShellOverlayLayer,
  AppShellPluginLayer,
  AppShellRibbon,
  AppShellRightSidebar,
  AppShellRoot,
  AppShellSettings,
  AppShellSettingsDialog,
  AppShellSidebar,
  AppShellStatusBar,
  AppShellSurface,
  AppShellTabs,
  AppShellWorkspace,
};

export const AppShell = {
  Root: AppShellRoot,
  BottomPanel: AppShellBottomPanel,
  DesktopLayout: AppShellDesktopLayout,
  About: AppShellAboutDialog,
  CommandPalette: AppShellCommandPalette,
  CorePluginsSettings: AppShellCorePluginsSettings,
  Ribbon: AppShellRibbon,
  HotkeySettings: AppShellHotkeySettingsSurface,
  LeftSidebar: AppShellLeftSidebar,
  Main: AppShellMain,
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
  SettingsDialog: AppShellSettingsDialog,
  Surface: AppShellSurface,
} as const;
