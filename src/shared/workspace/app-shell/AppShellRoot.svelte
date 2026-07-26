<script lang="ts">
  import { onMount, untrack, type Snippet } from "svelte";
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import type { WorkspaceTheme } from "../core/types.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import { setAppShellContext } from "./app-shell-context.svelte.js";
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
  });

  onMount(() => {
    const disposeSurface = root
      ? controller.ui.registerSurface(root)
      : () => {};
    if (autoStart) void controller.start();
    return () => {
      disposeSurface();
      drag.clear();
      if (disposeOnDestroy) void controller.dispose();
    };
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={root}
  class={`ui-app-shell ${resolvedTheme === "dark" ? "dark" : ""} ${className}`}
  data-ui-component="app-shell"
  data-ui-part="root"
  data-app-shell-root
  data-app-shell-ready={controller.ready}
  data-workspace-theme={resolvedTheme}
  data-workspace-dragging={drag.dragging}
  style={appearanceStyle}
  onkeydown={(event) => void controller.commands.handleKeydown(event)}
>
  {@render children?.()}
</div>
