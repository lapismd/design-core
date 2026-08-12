<script lang="ts">
  import type { WorkspaceTab } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceViewLabel from "../view-header/WorkspaceViewLabel.svelte";
  import WorkspaceViewHost from "../view-host/WorkspaceViewHost.svelte";

  let {
    controller,
    tab,
    paneId,
    onOpen,
    onClose,
  }: {
    controller: WorkspaceShellController;
    tab: WorkspaceTab;
    paneId: string;
    onOpen: () => void;
    onClose: () => void;
  } = $props();
</script>

<article
  class="ui-workspace-mobile-tab"
  data-ui-component="workspace-mobile-tab-tile"
  data-mobile-tab-tile={tab.id}
>
  <div class="ui-workspace-mobile-tab__preview">
    <div class="ui-workspace-mobile-tab__surface">
      <WorkspaceViewLabel
        {controller}
        {tab}
        hostId="root"
        {paneId}
        fallbackTitle={tab.title}
        class="ui-workspace-mobile-tab__title"
      />
      <WorkspaceViewHost {controller} {tab} hostId="root" {paneId} />
    </div>
    <button
      type="button"
      class="ui-workspace-mobile-tab__open"
      data-mobile-tab-open={tab.id}
      aria-label={`Open ${tab.title}`}
      onclick={onOpen}
    ></button>
    {#if tab.closable !== false}
      <button
        type="button"
        class="ui-workspace-mobile-tab__close"
        data-mobile-tab-close={tab.id}
        aria-label={`Close ${tab.title}`}
        onclick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <WorkspaceIcon name="x" />
      </button>
    {/if}
  </div>
  <h2>
    <WorkspaceViewLabel
      {controller}
      {tab}
      hostId="root"
      {paneId}
      fallbackTitle={tab.title}
    />
  </h2>
</article>
