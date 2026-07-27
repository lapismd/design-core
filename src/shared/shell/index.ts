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
import AppShellToolbar from "./AppShellToolbar.svelte";

export const Sidebar = Object.assign(AppShellSidebar, {
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
  AppShellToolbar,
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
  AppShellToolbar as Toolbar,
};

export const AppShell = {
  Root: AppShellRoot,
  Sidebar,
  Main: AppShellMain,
  Toolbar: AppShellToolbar,
  Body,
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
} from "./shell.tokens.js";
