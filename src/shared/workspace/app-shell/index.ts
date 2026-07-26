import AppShellFloatingLayer from "./AppShellFloatingLayer.svelte";
import AppShellLeftSidebar from "./AppShellLeftSidebar.svelte";
import AppShellRibbon from "./AppShellRibbon.svelte";
import AppShellRightSidebar from "./AppShellRightSidebar.svelte";
import AppShellRoot from "./AppShellRoot.svelte";
import AppShellSettings from "./AppShellSettings.svelte";
import AppShellStatusBar from "./AppShellStatusBar.svelte";
import AppShellSurface from "./AppShellSurface.svelte";
import AppShellWorkspace from "./AppShellWorkspace.svelte";

export {
  AppShellFloatingLayer,
  AppShellLeftSidebar,
  AppShellRibbon,
  AppShellRightSidebar,
  AppShellRoot,
  AppShellSettings,
  AppShellStatusBar,
  AppShellSurface,
  AppShellWorkspace,
};

export const AppShell = {
  Root: AppShellRoot,
  Ribbon: AppShellRibbon,
  LeftSidebar: AppShellLeftSidebar,
  Workspace: AppShellWorkspace,
  RightSidebar: AppShellRightSidebar,
  FloatingLayer: AppShellFloatingLayer,
  StatusBar: AppShellStatusBar,
  Settings: AppShellSettings,
  Surface: AppShellSurface,
} as const;
