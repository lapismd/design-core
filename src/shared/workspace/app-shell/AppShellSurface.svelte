<script lang="ts">
  import { onMount } from "svelte";
  import type {
    WorkspaceBottomPanelAlignment,
    WorkspaceRequestedDisplayMode,
    WorkspaceTab,
  } from "../core/types.js";
  import { createWorkspaceTab } from "../core/layout.js";
  import WorkspaceMobile from "../mobile/WorkspaceMobile.svelte";
  import type { WorkspaceNavigation } from "./workspace-navigation.js";
  import { getAppShellContext } from "./app-shell-context.svelte.js";
  import AppShellFloatingLayer from "./AppShellFloatingLayer.svelte";
  import AppShellBottomPanel from "./AppShellBottomPanel.svelte";
  import AppShellDesktopLayout from "./AppShellDesktopLayout.svelte";
  import AppShellLeftSidebar from "./AppShellLeftSidebar.svelte";
  import AppShellMain from "./AppShellMain.svelte";
  import AppShellRibbon from "./AppShellRibbon.svelte";
  import AppShellRightSidebar from "./AppShellRightSidebar.svelte";
  import AppShellSettingsDialog from "./AppShellSettingsDialog.svelte";
  import AppShellStatusBar from "./AppShellStatusBar.svelte";
  import AppShellWorkspace from "./AppShellWorkspace.svelte";

  let {
    createTab,
    displayMode,
    mobileBreakpoint,
    mobileDefaultPage,
    mobileShowBottomNav,
    mobileIncludeSidebars,
    mobileIncludeBottomPanel,
    mobileIncludeFloating,
    bottomPanelAlignment,
    onOpenSettings,
    settingsTitle = "Settings",
    workspaceLabel = "Workspace",
    workspaceNavigation,
  }: {
    createTab?: (paneId: string) => WorkspaceTab;
    displayMode?: WorkspaceRequestedDisplayMode;
    mobileBreakpoint?: number;
    mobileDefaultPage?: "editor" | "tabs";
    mobileShowBottomNav?: boolean;
    mobileIncludeSidebars?: boolean;
    mobileIncludeBottomPanel?: boolean;
    mobileIncludeFloating?: boolean;
    /** Override the configured desktop bottom-panel alignment. */
    bottomPanelAlignment?: WorkspaceBottomPanelAlignment;
    onOpenSettings?: () => void;
    settingsTitle?: string;
    workspaceLabel?: string;
    workspaceNavigation?: WorkspaceNavigation;
  } = $props();

  const context = getAppShellContext();
  const createEmptyTab = () =>
    createWorkspaceTab({
      title: "New Tab",
      icon: "ghost",
      view: { type: "empty", state: {} },
    });
  let resolvedCreateTab = $derived(createTab ?? createEmptyTab);
  let observedWidth = $state(Number.POSITIVE_INFINITY);
  let requestedMode = $derived(
    displayMode ?? context.controller.mobile.requestedDisplayMode,
  );
  let breakpoint = $derived(
    mobileBreakpoint ?? context.controller.mobile.breakpointPx,
  );
  let resolvedMode = $derived(
    requestedMode === "auto"
      ? observedWidth < breakpoint
        ? "mobile"
        : "desktop"
      : requestedMode,
  );

  $effect(() => context.controller.renderer.setDisplayMode(resolvedMode));

  function openSettings() {
    context.controller.settings.open();
    onOpenSettings?.();
  }

  onMount(() => {
    const root = context.root;
    if (!root) return;
    const update = () => {
      observedWidth = root.getBoundingClientRect().width;
    };
    const observer = new ResizeObserver(update);
    observer.observe(root);
    update();
    return () => observer.disconnect();
  });
</script>

{#if resolvedMode === "mobile"}
  <WorkspaceMobile
    controller={context.controller.renderer}
    createTab={resolvedCreateTab}
    defaultPage={mobileDefaultPage ?? context.controller.mobile.defaultPage}
    showBottomNav={mobileShowBottomNav ??
      context.controller.mobile.showBottomNav}
    includeSidebarsInTabs={mobileIncludeSidebars ??
      context.controller.mobile.includeSidebarsInTabs}
    includeBottomPanelInTabs={mobileIncludeBottomPanel ??
      context.controller.mobile.includeBottomPanelInTabs}
    includeFloatingInTabs={mobileIncludeFloating ??
      context.controller.mobile.includeFloatingInTabs}
    onOpenSettings={openSettings}
  />
{:else}
  <AppShellRibbon />
  <AppShellDesktopLayout {bottomPanelAlignment}>
    <AppShellLeftSidebar
      {workspaceLabel}
      {workspaceNavigation}
      onOpenSettings={openSettings}
    />
    <AppShellMain>
      <AppShellWorkspace createTab={resolvedCreateTab} />
    </AppShellMain>
    <AppShellRightSidebar />
    <AppShellBottomPanel createTab={resolvedCreateTab} />
  </AppShellDesktopLayout>
  <AppShellFloatingLayer createTab={resolvedCreateTab} />
  <AppShellStatusBar />
{/if}

<AppShellSettingsDialog
  bind:open={
    () => context.controller.settings.dialogOpen,
    (next) => {
      context.controller.settings.dialogOpen = next;
      if (!next) context.controller.settings.revealFieldId = null;
    }
  }
  title={settingsTitle}
/>
