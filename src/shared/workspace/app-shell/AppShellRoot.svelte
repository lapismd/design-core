<script lang="ts">
  import { onMount, untrack, type Snippet } from "svelte";
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import type { WorkspacePopoutHost, WorkspaceTheme } from "../core/types.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import AppShellPopoutLayer from "../popout/AppShellPopoutLayer.svelte";
  import { setAppShellContext } from "./app-shell-context.svelte.js";
  import AppShellOverlayLayer from "./AppShellOverlayLayer.svelte";
  import "./AppShellRoot.css";

  let {
    controller,
    children,
    autoStart = true,
    disposeOnDestroy = false,
    theme,
    accentColor,
    fontSize,
    zoomLevel,
    activateNewTabs = true,
    popoutHost,
    renderOverlays = true,
    renderPopouts = true,
    class: className = "",
  }: {
    controller: AppShellController;
    children?: Snippet;
    autoStart?: boolean;
    disposeOnDestroy?: boolean;
    theme?: WorkspaceTheme;
    accentColor?: string;
    fontSize?: number;
    zoomLevel?: number;
    /** Whether user-created tabs become active immediately. */
    activateNewTabs?: boolean;
    popoutHost?: WorkspacePopoutHost | null;
    renderOverlays?: boolean;
    renderPopouts?: boolean;
    class?: string;
  } = $props();

  const rootController = untrack(() => controller);
  const drag = new WorkspaceDragState(rootController.renderer);
  let root = $state<HTMLDivElement | null>(null);
  let resolvedTheme = $derived(theme ?? controller.appearance.theme);
  let resolvedAccent = $derived(
    accentColor ?? controller.appearance.accentColor,
  );
  let resolvedFontSize = $derived(fontSize ?? controller.appearance.fontSize);
  let resolvedZoom = $derived(zoomLevel ?? controller.appearance.zoomLevel);
  let appearanceStyle = $derived(
    [
      `font-size: ${resolvedFontSize}px`,
      `zoom: ${resolvedZoom / 16}`,
      `--ui-workspace-accent: ${resolvedAccent}`,
      `--ui-workspace-focus-ring: ${resolvedAccent}`,
      `--ui-workspace-selection: color-mix(in srgb, ${resolvedAccent} 14%, transparent)`,
    ].join("; "),
  );

  setAppShellContext(rootController, drag, () => root);

  $effect(() => {
    controller.renderer.showTabTitleBar = controller.appearance.showTabTitleBar;
    controller.renderer.showInlineTitle = controller.appearance.showInlineTitle;
    controller.renderer.activateNewTabs = activateNewTabs;
  });

  onMount(() => {
    const document = root?.ownerDocument;
    const handleDocumentKeydown = (event: KeyboardEvent) => {
      if (!root || event.defaultPrevented) return;
      const target = event.target;
      if (
        target instanceof Node &&
        target !== document?.body &&
        target !== document?.documentElement &&
        !root.contains(target)
      ) {
        return;
      }
      void controller.commands.handleKeydown(event);
    };
    const disposeSurface = root
      ? controller.ui.registerSurface(root)
      : () => {};
    document?.addEventListener("keydown", handleDocumentKeydown);
    if (autoStart) void controller.start();
    return () => {
      document?.removeEventListener("keydown", handleDocumentKeydown);
      disposeSurface();
      drag.clear();
      if (disposeOnDestroy) void controller.dispose();
    };
  });
</script>

<div
  bind:this={root}
  class={`ui-app-shell ${resolvedTheme === "dark" ? "dark" : ""} ${className}`}
  data-ui-component="app-shell"
  data-ui-part="root"
  data-app-shell-root
  data-app-shell-ready={controller.ready}
  data-workspace-theme={resolvedTheme}
  data-workspace-dragging={drag.dragging}
  data-workspace-focus-mode={controller.renderer.focusMode ? "true" : undefined}
  style={appearanceStyle}
>
  {@render children?.()}
  {#if renderPopouts}
    <AppShellPopoutLayer host={popoutHost} theme={resolvedTheme} />
  {/if}
  {#if renderOverlays && root}
    <AppShellOverlayLayer portalTarget={root} />
  {/if}
</div>
