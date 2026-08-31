<script lang="ts">
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import { ContextMenu } from "bits-ui";
  import type {
    WorkspaceMenu,
    WorkspaceMenuEntry,
  } from "../core/workspace-menu.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceContextMenuItemsRecursive from "./WorkspaceContextMenuItems.svelte";
  import "./WorkspaceMenuItems.css";

  let {
    menu,
    entries = menu.entries,
  }: {
    menu: WorkspaceMenu;
    entries?: WorkspaceMenuEntry[];
  } = $props();

  async function select(
    entry: Extract<WorkspaceMenuEntry, { kind: "item" }>,
    event: MouseEvent,
  ) {
    if (entry.disabled) return;
    const selectedMenu = menu;
    await entry.callback?.(event);
    if (entry.closeOnSelect) selectedMenu.hide();
  }
</script>

{#each entries as entry, index (`${entry.kind}-${index}`)}
  {#if entry.kind === "separator"}
    <ContextMenu.Separator
      class="ui-workspace-menu__separator"
      data-ui-component="workspace-menu"
      data-ui-part="separator"
    />
  {:else if entry.kind === "submenu"}
    <ContextMenu.Sub>
      <ContextMenu.SubTrigger
        class="ui-workspace-menu__item ui-workspace-menu__sub-trigger"
        data-ui-component="workspace-menu"
        data-ui-part="sub-trigger"
        disabled={entry.disabled}
      >
        {#if entry.icon}<WorkspaceIcon name={entry.icon} />{/if}
        <span class="ui-workspace-menu__label">{entry.title}</span>
        <ChevronRight
          class="ui-workspace-menu__submenu-icon"
          aria-hidden="true"
        />
      </ContextMenu.SubTrigger>
      <ContextMenu.Portal>
        <ContextMenu.SubContent
          class="ui-workspace-menu__content"
          data-ui-component="workspace-menu"
          data-ui-part="sub-content"
          sideOffset={4}
        >
          <WorkspaceContextMenuItemsRecursive
            menu={entry.menu}
            entries={entry.menu.entries}
          />
        </ContextMenu.SubContent>
      </ContextMenu.Portal>
    </ContextMenu.Sub>
  {:else}
    <ContextMenu.Item
      class="ui-workspace-menu__item"
      data-ui-component="workspace-menu"
      data-ui-part="item"
      disabled={entry.disabled}
      onclick={(event) => select(entry, event)}
    >
      {#if entry.icon}<WorkspaceIcon name={entry.icon} />{/if}
      <span class="ui-workspace-menu__label">{entry.title}</span>
      {#if entry.checked !== undefined}
        <span class="ui-workspace-menu__check" aria-hidden="true">
          {entry.checked ? "✓" : ""}
        </span>
      {/if}
    </ContextMenu.Item>
  {/if}
{/each}
