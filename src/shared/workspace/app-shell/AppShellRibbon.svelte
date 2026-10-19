<script lang="ts">
  import WorkspaceRibbon from "../ribbon/WorkspaceRibbon.svelte";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  let { onOpenSettings }: { onOpenSettings?: () => void } = $props();
  const { controller } = getAppShellContext();
</script>

{#if controller.appearance.showRibbon}
  <WorkspaceRibbon controller={controller.renderer}>
    {#snippet bottomActions()}
      <button
        type="button"
        class="ui-workspace-ribbon__action"
        data-ui-part="settings-action"
        aria-label="Settings"
        title="Open settings"
        data-hint-target="ribbon-action"
        data-hint-group="ribbon"
        data-hint-action="click"
        data-hint-target-id="ribbon:app-shell:settings"
        data-hint-label="Settings"
        onclick={() =>
          onOpenSettings ? onOpenSettings() : controller.settings.open()}
      >
        <WorkspaceIcon name="settings" />
      </button>
    {/snippet}
  </WorkspaceRibbon>
{/if}
