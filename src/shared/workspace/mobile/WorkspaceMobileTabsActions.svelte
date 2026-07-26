<script lang="ts">
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceMobileActionSheet from "./WorkspaceMobileActionSheet.svelte";

  let {
    open = $bindable(false),
    tabCount,
    canUndoClose,
    onNewTab,
    onUndoCloseTab,
    onCloseTabs,
  }: {
    open?: boolean;
    tabCount: number;
    canUndoClose: boolean;
    onNewTab: () => void;
    onUndoCloseTab: () => void;
    onCloseTabs: () => void;
  } = $props();

  function closeAfter(run: () => void) {
    run();
    open = false;
  }
</script>

<WorkspaceMobileActionSheet
  bind:open
  title={`${tabCount} open tabs`}
  description="Open tabs actions"
>
  <section class="ui-workspace-mobile-sheet__group">
    <button
      type="button"
      class="ui-workspace-mobile-sheet__action"
      onclick={() => closeAfter(onNewTab)}
    >
      <WorkspaceIcon name="plus" />
      <span>New Tab</span>
    </button>
    <div class="ui-workspace-mobile-sheet__separator"></div>
    <button
      type="button"
      class="ui-workspace-mobile-sheet__action"
      disabled={!canUndoClose}
      onclick={() => closeAfter(onUndoCloseTab)}
    >
      <WorkspaceIcon name="rotate-ccw" />
      <span>Undo close tab</span>
    </button>
    <div class="ui-workspace-mobile-sheet__separator"></div>
    <button
      type="button"
      class="ui-workspace-mobile-sheet__action"
      data-variant="destructive"
      onclick={() => closeAfter(onCloseTabs)}
    >
      <WorkspaceIcon name="x" />
      <span>Close tabs</span>
    </button>
  </section>
</WorkspaceMobileActionSheet>
