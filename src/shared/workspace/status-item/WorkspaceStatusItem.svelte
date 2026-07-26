<script lang="ts">
  import { DropdownMenu } from "bits-ui";
  import type { WorkspaceStatusItem as WorkspaceStatusItemModel } from "../core/types.js";
  import { WorkspaceMenu } from "../core/workspace-menu.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceMenuItems from "../menu/WorkspaceMenuItems.svelte";
  import "./WorkspaceStatusItem.css";

  let { item }: { item: WorkspaceStatusItemModel } = $props();
  let open = $state(false);
  let menu = $state(new WorkspaceMenu());

  function setOpen(next: boolean): void {
    open = next;
    if (next) {
      menu = new WorkspaceMenu();
      item.buildMenu?.(menu);
      menu.open = true;
    } else {
      menu.hide();
    }
  }
</script>

{#snippet content()}
  {#if item.icon}
    <span
      class="ui-workspace-status-item__icon"
      data-ui-part="icon"
      data-busy={item.busy}
      aria-hidden="true"
    >
      <WorkspaceIcon name={item.icon} />
    </span>
  {/if}
  {#if item.segments}
    {#each item.segments as segment}
      <span class="ui-workspace-status-item__segment">{segment}</span>
    {/each}
  {:else if item.label}
    <span data-ui-part="label">{item.label}</span>
  {/if}
{/snippet}

{#if item.buildMenu}
  <DropdownMenu.Root {open} onOpenChange={setOpen}>
    <DropdownMenu.Trigger
      class="ui-workspace-status-item"
      data-ui-component="workspace-status-item"
      data-ui-part="trigger"
      disabled={item.disabled}
      title={item.tooltip ?? item.label}
      aria-label={item.tooltip ?? item.label ?? item.id}
      aria-busy={item.busy}
      data-status-bar-item-id={item.id}
      data-hint-target="status-action"
      data-hint-group="status"
      data-hint-action="click"
      data-hint-target-id={`status:${item.id}`}
      data-hint-label={item.tooltip ?? item.label ?? item.id}
    >
      {@render content()}
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        class="ui-workspace-menu__content"
        data-ui-component="workspace-menu"
        data-ui-part="content"
        align="end"
        side="top"
        sideOffset={4}
      >
        <WorkspaceMenuItems {menu} />
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
{:else}
  <button
    type="button"
    class="ui-workspace-status-item"
    data-ui-component="workspace-status-item"
    data-ui-part="button"
    disabled={item.disabled}
    title={item.tooltip ?? item.label}
    aria-label={item.tooltip ?? item.label ?? item.id}
    aria-busy={item.busy}
    data-status-bar-item-id={item.id}
    data-hint-target="status-action"
    data-hint-group="status"
    data-hint-action="click"
    data-hint-target-id={`status:${item.id}`}
    data-hint-label={item.tooltip ?? item.label ?? item.id}
    onclick={(event) => item.onSelect?.(event)}
  >
    {@render content()}
  </button>
{/if}
