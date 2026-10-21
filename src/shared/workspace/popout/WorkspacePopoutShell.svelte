<script lang="ts">
  import { onMount, untrack, setContext } from "svelte";
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import type { WorkspaceTheme } from "../core/types.js";
  import type { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import type { ScrollAreaVisibility } from "../../shadcn/scroll-area/index.js";
  import { setAppShellContext } from "../app-shell/app-shell-context.svelte.js";
  import AppShellOverlayLayer from "../app-shell/AppShellOverlayLayer.svelte";
  import { disableOverlayPortalContextKey } from "../../../lib/overlay-portal-context.js";
  import WorkspacePopoutSurface from "./WorkspacePopoutSurface.svelte";

  let {
    app,
    id,
    drag,
    settings,
  }: {
    app: AppShellController;
    id: string;
    drag: WorkspaceDragState;
    settings: {
      theme: WorkspaceTheme;
      scrollbarVisibility: ScrollAreaVisibility;
      appearanceStyle: string;
    };
  } = $props();
  let root = $state<HTMLDivElement | null>(null);
  let workspaceWindow = $derived(
    app.renderer.layout.windows.find((win) => win.id === id),
  );
  untrack(() => setAppShellContext(app, drag, () => root));
  setContext(disableOverlayPortalContextKey, true);
  onMount(() => {
    const doc = root!.ownerDocument;
    const focus = () => {
      if (app.commands.focusedHostId === id) return;
      app.commands.focusedHostId = id;
      app.renderer.activateHost(id);
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      focus();
      void app.commands.handleKeydown(event);
    };
    const dispose = app.ui.registerSurface(root!);
    doc.addEventListener("keydown", keydown);
    doc.addEventListener("focusin", focus);
    doc.defaultView?.addEventListener("focus", focus);
    return () => {
      dispose();
      doc.removeEventListener("keydown", keydown);
      doc.removeEventListener("focusin", focus);
      doc.defaultView?.removeEventListener("focus", focus);
      if (app.commands.focusedHostId === id)
        app.commands.focusedHostId = "root";
    };
  });
</script>

<div
  bind:this={root}
  class="ui-app-shell"
  class:dark={settings.theme === "dark"}
  style={settings.appearanceStyle}
  data-app-shell-root
  data-workspace-theme={settings.theme}
>
  {#if workspaceWindow}
    <WorkspacePopoutSurface
      controller={app.renderer}
      window={workspaceWindow}
      {drag}
      theme={settings.theme}
      scrollbarVisibility={settings.scrollbarVisibility}
    />
    {#if root && app.commands.focusedHostId === id}
      <AppShellOverlayLayer portalTarget={root} />
    {/if}
  {/if}
</div>
