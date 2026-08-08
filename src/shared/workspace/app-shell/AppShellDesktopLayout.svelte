<script lang="ts">
  import type { Snippet } from "svelte";
  import type { WorkspaceBottomPanelAlignment } from "../core/types.js";
  import { getAppShellContext } from "./app-shell-context.svelte.js";
  import "./AppShellDesktopLayout.css";

  let {
    children,
    bottomPanelAlignment,
  }: {
    children?: Snippet;
    /** Override the controller-owned desktop bottom-panel alignment. */
    bottomPanelAlignment?: WorkspaceBottomPanelAlignment;
  } = $props();

  const { controller } = getAppShellContext();
  let resolvedAlignment = $derived(
    bottomPanelAlignment ?? controller.workspace.bottomPanelAlignment,
  );
  let bottomPanelHeight = $derived(
    `${controller.renderer.layout.bottom.size}px`,
  );
</script>

<div
  class="ui-app-shell__desktop-layout"
  data-ui-component="app-shell-desktop-layout"
  data-ui-part="desktop-layout"
  data-bottom-panel-alignment={resolvedAlignment}
  style:--ui-app-shell-bottom-panel-height={bottomPanelHeight}
>
  {@render children?.()}
</div>
