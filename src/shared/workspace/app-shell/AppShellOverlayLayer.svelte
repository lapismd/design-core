<script lang="ts">
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  const { controller } = getAppShellContext();
  let { portalTarget }: { portalTarget: HTMLElement } = $props();
</script>

<div
  class="ui-app-shell__overlay-layer"
  data-ui-part="overlay-layer"
  aria-live="polite"
>
  {#each controller.ui.overlays as overlay (overlay.id)}
    {@const OverlayComponent = overlay.component}
    <OverlayComponent app={controller} {portalTarget} {...overlay.props} />
  {/each}
</div>
