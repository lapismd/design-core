<script lang="ts">
  import type { Snippet } from "svelte";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type { WorkspaceAction } from "../core/types.js";

  let {
    actions = [],
    footer,
  }: {
    actions?: readonly WorkspaceAction[];
    footer?: Snippet;
  } = $props();
</script>

<nav
  aria-label="Workspace actions"
  data-ui-component="workspace"
  data-ui-part="action-ribbon"
>
  <div data-ui-component="workspace" data-ui-part="action-list">
    {#each actions as action (action.id)}
      {@const Icon = action.icon}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={action.label}
        aria-pressed={action.pressed}
        disabled={action.disabled}
        data-workspace-action={action.id}
        onclick={action.onSelect}
      >
        <Icon />
      </Button>
    {/each}
  </div>
  {#if footer}
    <div data-ui-component="workspace" data-ui-part="action-footer">
      {@render footer()}
    </div>
  {/if}
</nav>

<style>
  [data-ui-component="workspace"][data-ui-part="action-ribbon"] {
    display: flex;
    width: var(--ui-workspace-ribbon-width, 2.75rem);
    min-width: var(--ui-workspace-ribbon-width, 2.75rem);
    min-height: 0;
    height: 100%;
    flex-direction: column;
    border-right: 1px solid var(--ui-workspace-divider, var(--sidebar-border));
    background: var(--ui-workspace-ribbon-background, var(--sidebar));
  }

  [data-ui-component="workspace"][data-ui-part="action-list"] {
    display: flex;
    min-height: 0;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
    padding-block: 0.25rem;
  }

  [data-ui-component="workspace"][data-ui-part="action-ribbon"]
    :global([data-workspace-action]) {
    width: calc(var(--ui-workspace-ribbon-width, 2.75rem) - 0.5rem);
    height: calc(var(--ui-workspace-ribbon-width, 2.75rem) - 0.5rem);
    border-radius: 0.25rem;
  }

  [data-ui-component="workspace"][data-ui-part="action-ribbon"]
    :global([data-workspace-action]:hover:not(:disabled)) {
    background: var(--ui-workspace-action-hover, var(--accent));
  }

  [data-ui-component="workspace"][data-ui-part="action-ribbon"]
    :global([data-workspace-action][aria-pressed="true"]) {
    background: var(--ui-workspace-action-active, var(--accent));
    color: var(--accent-foreground);
  }

  [data-ui-component="workspace"][data-ui-part="action-footer"] {
    display: flex;
    margin-top: auto;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
    padding-block: 0.25rem;
  }
</style>
