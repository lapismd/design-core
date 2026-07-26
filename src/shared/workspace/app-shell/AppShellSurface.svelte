<script lang="ts">
  import { onMount } from "svelte";
  import type {
    WorkspaceRequestedDisplayMode,
    WorkspaceTab,
  } from "../core/types.js";
  import WorkspaceMobile from "../mobile/WorkspaceMobile.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";
  import AppShellFloatingLayer from "./AppShellFloatingLayer.svelte";
  import AppShellLeftSidebar from "./AppShellLeftSidebar.svelte";
  import AppShellRibbon from "./AppShellRibbon.svelte";
  import AppShellRightSidebar from "./AppShellRightSidebar.svelte";
  import AppShellStatusBar from "./AppShellStatusBar.svelte";
  import AppShellWorkspace from "./AppShellWorkspace.svelte";

  let {
    createTab,
    displayMode,
    mobileBreakpoint,
    mobileDefaultPage,
    mobileShowBottomNav,
    mobileIncludeSidebars,
    mobileIncludeFloating,
    onOpenSettings,
  }: {
    createTab?: (paneId: string) => WorkspaceTab;
    displayMode?: WorkspaceRequestedDisplayMode;
    mobileBreakpoint?: number;
    mobileDefaultPage?: "editor" | "tabs";
    mobileShowBottomNav?: boolean;
    mobileIncludeSidebars?: boolean;
    mobileIncludeFloating?: boolean;
    onOpenSettings?: () => void;
  } = $props();

  const context = getAppShellContext();
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
    {createTab}
    defaultPage={mobileDefaultPage ?? context.controller.mobile.defaultPage}
    showBottomNav={mobileShowBottomNav ??
      context.controller.mobile.showBottomNav}
    includeSidebarsInTabs={mobileIncludeSidebars ??
      context.controller.mobile.includeSidebarsInTabs}
    includeFloatingInTabs={mobileIncludeFloating ??
      context.controller.mobile.includeFloatingInTabs}
    {onOpenSettings}
  />
{:else}
  <AppShellRibbon />
  <AppShellLeftSidebar />
  <AppShellWorkspace {createTab} />
  <AppShellRightSidebar />
  <AppShellFloatingLayer {createTab} />
  <AppShellStatusBar />
{/if}
