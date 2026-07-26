<script lang="ts">
  import type { WorkspaceMenuEntry } from "../core/workspace-menu.js";
  import type { WorkspaceTab } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceMobileActionSheet from "./WorkspaceMobileActionSheet.svelte";

  let {
    controller,
    activeTab,
    open = $bindable(false),
    onNewTab,
    onOpenRightSidebar,
    onOpenSettings,
    onOpenCommandPalette,
  }: {
    controller: WorkspaceShellController;
    activeTab: WorkspaceTab | null;
    open?: boolean;
    onNewTab: () => void;
    onOpenRightSidebar: () => void;
    onOpenSettings?: () => void;
    onOpenCommandPalette?: () => void;
  } = $props();

  let menu = $derived(
    activeTab ? controller.createPaneMenu(activeTab.id) : null,
  );
  let menuSections = $derived.by(() => {
    const sections: WorkspaceMenuEntry[][] = [[]];
    for (const entry of menu?.entries ?? []) {
      if (entry.kind === "separator") {
        if (sections.at(-1)?.length) sections.push([]);
      } else {
        sections.at(-1)!.push(entry);
      }
    }
    return sections.filter((section) => section.length > 0);
  });
  let quickActions = $derived([
    {
      id: "command-palette",
      title: "Open command palette",
      icon: "search",
      disabled: !onOpenCommandPalette,
      run: () => onOpenCommandPalette?.(),
    },
    {
      id: "new-tab",
      title: "Create new tab",
      icon: "square-pen",
      disabled: false,
      run: onNewTab,
    },
    {
      id: "right-sidebar",
      title: "Open right sidebar",
      icon: "panel-right",
      disabled: false,
      run: onOpenRightSidebar,
    },
    {
      id: "settings",
      title: "Open settings",
      icon: "settings-2",
      disabled: !onOpenSettings,
      run: () => onOpenSettings?.(),
    },
  ]);

  function closeAfter(run: () => void) {
    run();
    open = false;
  }

  async function selectEntry(
    entry: Extract<WorkspaceMenuEntry, { kind: "item" }>,
    event: MouseEvent,
  ) {
    if (entry.disabled) return;
    await entry.callback?.(event);
    if (entry.closeOnSelect) open = false;
  }
</script>

<WorkspaceMobileActionSheet
  bind:open
  title="More actions"
  description="Mobile workspace actions"
>
  <div
    class="ui-workspace-mobile-sheet__groups"
    data-ui-part="mobile-action-groups"
  >
    <section class="ui-workspace-mobile-sheet__group">
      {#each quickActions as action, index (action.id)}
        <button
          type="button"
          class="ui-workspace-mobile-sheet__action"
          disabled={action.disabled}
          onclick={() => closeAfter(action.run)}
        >
          <WorkspaceIcon name={action.icon} />
          <span>{action.title}</span>
        </button>
        {#if index < quickActions.length - 1}
          <div class="ui-workspace-mobile-sheet__separator"></div>
        {/if}
      {/each}
    </section>

    {#each menuSections as entries}
      <section class="ui-workspace-mobile-sheet__group">
        {#each entries as entry, index}
          {#if entry.kind === "item"}
            <button
              type="button"
              class="ui-workspace-mobile-sheet__action"
              disabled={entry.disabled}
              onclick={(event) => selectEntry(entry, event)}
            >
              <WorkspaceIcon name={entry.icon ?? "blank"} />
              <span>{entry.title}</span>
            </button>
            {#if index < entries.length - 1}
              <div class="ui-workspace-mobile-sheet__separator"></div>
            {/if}
          {/if}
        {/each}
      </section>
    {/each}
  </div>
</WorkspaceMobileActionSheet>
