<script lang="ts">
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  const context = getAppShellContext();
  let portalTarget = $derived(context.root);
</script>

{#if portalTarget}
  {#each context.controller.ui.overlays as overlay (overlay.id)}
    {@const OverlayComponent = overlay.component}
    <OverlayComponent
      app={context.controller}
      {portalTarget}
      {...overlay.props}
    />
  {/each}
{/if}
