import AppShellTopbar from "./AppShellTopbar.svelte";
import AppShellTopbarTarget from "./AppShellTopbarTarget.svelte";
import AppShellBody from "./AppShellBody.svelte";
import AppShellBodyContent from "./AppShellBodyContent.svelte";
import AppShellBodySidebar from "./AppShellBodySidebar.svelte";
import AppShellBodyToggle from "./AppShellBodyToggle.svelte";
import AppShellMain from "./AppShellMain.svelte";
import AppShellRoot from "./AppShellRoot.svelte";
import AppShellSidebar from "./AppShellSidebar.svelte";
import AppShellSidebarBody from "./AppShellSidebarBody.svelte";
import AppShellSidebarClose from "./AppShellSidebarClose.svelte";
import AppShellSidebarFooter from "./AppShellSidebarFooter.svelte";
import AppShellSidebarHeader from "./AppShellSidebarHeader.svelte";
import AppShellSidebarToggle from "./AppShellSidebarToggle.svelte";
import AppShellSidebarSection from "./AppShellSidebarSection.svelte";
import AppShellSurfaceLayer from "./AppShellSurfaceLayer.svelte";
import AppShellSurfaceLayerBody from "./AppShellSurfaceLayerBody.svelte";
import AppShellSurfaceLayerHeader from "./AppShellSurfaceLayerHeader.svelte";
import AppShellSurfaceLayerFooter from "./AppShellSurfaceLayerFooter.svelte";
import AppShellSurfaceLayerClose from "./AppShellSurfaceLayerClose.svelte";
import AppShellToolbar from "./AppShellToolbar.svelte";

export const Topbar = Object.assign(AppShellTopbar, {
  Target: AppShellTopbarTarget,
});

export const Sidebar = Object.assign(AppShellSidebar, {
  Section: AppShellSidebarSection,
  Header: AppShellSidebarHeader,
  Body: AppShellSidebarBody,
  Footer: AppShellSidebarFooter,
  Close: AppShellSidebarClose,
  Toggle: AppShellSidebarToggle,
});

export const Body = Object.assign(AppShellBody, {
  Content: AppShellBodyContent,
  Sidebar: AppShellBodySidebar,
  Toggle: AppShellBodyToggle,
});

export const SurfaceLayer = Object.assign(AppShellSurfaceLayer, {
  Footer: AppShellSurfaceLayerFooter,
  Close: AppShellSurfaceLayerClose,
  Header: AppShellSurfaceLayerHeader,
  Body: AppShellSurfaceLayerBody,
});

export {
  AppShellBody,
  AppShellBodyContent,
  AppShellBodySidebar,
  AppShellBodyToggle,
  AppShellMain,
  AppShellRoot,
  AppShellSidebar,
  AppShellSidebarBody,
  AppShellSidebarClose,
  AppShellSidebarFooter,
  AppShellSidebarHeader,
  AppShellSidebarToggle,
  AppShellSidebarSection,
  AppShellSidebarSection as SidebarSection,
  AppShellSurfaceLayer,
  AppShellSurfaceLayerBody,
  AppShellSurfaceLayerHeader,
  AppShellSurfaceLayerFooter,
  AppShellSurfaceLayerClose,
  AppShellSurfaceLayerFooter as SurfaceLayerFooter,
  AppShellSurfaceLayerClose as SurfaceLayerClose,
  AppShellToolbar,
  AppShellTopbar,
  AppShellTopbarTarget,
  AppShellTopbarTarget as TopbarTarget,
  AppShellBodyContent as BodyContent,
  AppShellBodySidebar as BodySidebar,
  AppShellBodyToggle as BodyToggle,
  AppShellMain as Main,
  AppShellRoot as Root,
  AppShellSidebarBody as SidebarBody,
  AppShellSidebarClose as SidebarClose,
  AppShellSidebarFooter as SidebarFooter,
  AppShellSidebarHeader as SidebarHeader,
  AppShellSidebarToggle as SidebarToggle,
  AppShellSurfaceLayerBody as SurfaceLayerBody,
  AppShellSurfaceLayerHeader as SurfaceLayerHeader,
  AppShellToolbar as Toolbar,
};

export const AppShell = {
  Topbar,
  Root: AppShellRoot,
  Sidebar,
  Main: AppShellMain,
  Toolbar: AppShellToolbar,
  Body,
  SurfaceLayer,
} as const;

export * from "./app-shell-body-context.svelte.js";
export * from "./app-shell-context.svelte.js";
export * from "./app-shell-controller.svelte.js";
export * from "./app-shell-persistence.js";
export {
  shellTokenDefaults,
  shellTokenNames,
  type ShellToken,
  type ShellTokenKey,
} from "../shell.tokens.js";
