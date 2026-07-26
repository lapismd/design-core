<script lang="ts">
  import { onMount, tick } from "svelte";
  import { AppShell } from "../../app-shell/index.js";
  import type {
    WorkspaceDropPosition,
    WorkspaceRequestedDisplayMode,
  } from "../../index.js";
  import { createWorkspaceTab } from "../../index.js";
  import WorkspaceDropOverlay from "../../drop-overlay/WorkspaceDropOverlay.svelte";
  import { createFrameworkDemo } from "../../demo/framework-demo.js";
  import { createCy0004App } from "./cy0004-fixture.js";
  import "./Cy0004ParitySurface.css";

  let {
    sourceStoryId,
  }: {
    sourceStoryId: string;
  } = $props();

  let isDrop = $derived(sourceStoryId.includes("drag-and-drop-overlays"));
  let isSettings = $derived(
    sourceStoryId.includes("settings") ||
      sourceStoryId.includes("core-plugins-settings") ||
      sourceStoryId.includes("hotkey-settings"),
  );
  let isFMode = $derived(sourceStoryId.includes("plugins-f-mode"));
  let isNotifications = $derived(
    sourceStoryId.includes("plugins-notifications"),
  );
  let usesFrameworkFixture = $derived(isFMode || isNotifications);
  let app = $derived(
    usesFrameworkFixture
      ? createFrameworkDemo({
          includeFloating: false,
          includeFMode: isFMode,
          includeNotifications: isNotifications,
        }).app
      : createCy0004App(sourceStoryId),
  );
  let displayMode: WorkspaceRequestedDisplayMode = $derived(
    sourceStoryId.includes("mobile") ? "mobile" : "desktop",
  );
  let dropPosition: WorkspaceDropPosition = $derived(
    sourceStoryId.includes("--left")
      ? "left"
      : sourceStoryId.includes("--right")
        ? "right"
        : sourceStoryId.includes("--top")
          ? "top"
          : sourceStoryId.includes("--bottom")
            ? "bottom"
            : "center",
  );
  let prepared = $state(false);
  let createdTabIndex = 0;
  let usesCompleteSurface = $derived(
    isSettings ||
      isFMode ||
      isNotifications ||
      sourceStoryId.includes("-demo-") ||
      sourceStoryId.includes("shell-full-shell") ||
      sourceStoryId.includes("reference-parity") ||
      sourceStoryId.includes("ribbon-and-status-bar"),
  );

  function createTab(paneId: string) {
    createdTabIndex += 1;
    return createWorkspaceTab({
      id: `cy0004-${paneId}-${createdTabIndex}`,
      title: "Untitled",
      icon: "file-text",
      view: { type: "cy0004-empty", state: { fullActions: false } },
    });
  }

  async function prepare() {
    await app.start();
    if (
      sourceStoryId.includes(
        "components-declarative-settings--all-supported-controls",
      )
    ) {
      app.settings.selectSection("advanced");
    }
    if (
      sourceStoryId.includes("components-declarative-settings--settings") &&
      !sourceStoryId.includes("--settings-mobile")
    ) {
      app.settings.update("enabled-surfaces", ["left", "right", "status"]);
    }
    await tick();
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    if (sourceStoryId.includes("empty-split-is-pruned")) {
      app.workspace.closeLeaf("reference");
    }
    if (isFMode) {
      await app.commands.execute("toggle-fmode");
    }
    if (isNotifications) {
      if (sourceStoryId.includes("toast-severities")) {
        for (const notification of [
          {
            id: "toast-info",
            title: "Framework update",
            message: "The reusable shell is ready.",
            severity: "info" as const,
          },
          {
            id: "toast-warning",
            title: "Check configuration",
            message: "A demo setting needs your attention.",
            severity: "warning" as const,
          },
          {
            id: "toast-error",
            title: "Demo operation failed",
            message: "No application data was changed.",
            severity: "error" as const,
          },
        ]) {
          app.notifications.notify({
            ...notification,
            duration: 0,
          });
        }
      } else {
        for (const notification of [
          {
            id: "history-info",
            title: "Workspace restored",
            message: "Your previous layout was loaded.",
            severity: "info" as const,
          },
          {
            id: "history-warning",
            title: "Sync paused",
            message: "Reconnect to continue.",
            severity: "warning" as const,
          },
        ]) {
          app.notifications.notify({
            ...notification,
            persist: true,
            duration: 0,
          });
          app.notifications.dismiss(notification.id);
        }
        await app.commands.execute("plugin-notifications:toggle-center");
      }
    }
    if (sourceStoryId.includes("components-tabs--top")) {
      document
        .querySelector<HTMLButtonElement>(
          ".ui-cy0004-parity [aria-label='Tab overflow menu']",
        )
        ?.click();
    }
    await tick();
    if (
      isSettings &&
      sourceStoryId.includes("declarative-settings--settings")
    ) {
      const search = document.querySelector<HTMLInputElement>(
        ".ui-cy0004-parity [aria-label='Search settings']",
      );
      if (search) {
        search.value = "colour";
        search.dispatchEvent(new InputEvent("input", { bubbles: true }));
      }
    }
    prepared = true;
  }

  onMount(() => {
    void prepare();
  });
</script>

<div
  class="ui-cy0004-parity"
  data-cy0004-source-story={sourceStoryId}
  data-cy0004-parity-ready={prepared}
>
  {#if isDrop}
    <div class="ui-cy0004-parity__drop">
      <WorkspaceDropOverlay position={dropPosition} width={760} height={460} />
    </div>
  {:else}
    <AppShell.Root controller={app} theme="inherit">
      {#if usesCompleteSurface || displayMode === "mobile"}
        <AppShell.Surface
          {displayMode}
          {createTab}
          workspaceLabel={isSettings
            ? "Workspace"
            : usesFrameworkFixture
              ? "Framework demo"
              : "Legacy browser vault"}
        />
      {:else}
        <AppShell.Ribbon />
        <AppShell.LeftSidebar />
        <AppShell.Workspace {createTab} />
        <AppShell.RightSidebar />
        <AppShell.FloatingLayer {createTab} />
        <AppShell.StatusBar />
      {/if}
      {#if isSettings}
        <AppShell.SettingsDialog open={true} title="Settings" />
      {/if}
    </AppShell.Root>
  {/if}
</div>
