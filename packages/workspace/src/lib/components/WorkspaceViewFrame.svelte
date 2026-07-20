<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type {
    WorkspaceAction,
    WorkspaceViewNavigationAction,
  } from "../core/types.js";

  let {
    title,
    icon,
    back,
    forward,
    actions = [],
    options,
    children,
  }: {
    title: string;
    icon?: Component;
    back?: WorkspaceViewNavigationAction;
    forward?: WorkspaceViewNavigationAction;
    actions?: readonly WorkspaceAction[];
    /** Consumer-owned menu or controls displayed after the header actions. */
    options?: Snippet;
    children?: Snippet;
  } = $props();
</script>

<section data-ui-component="workspace" data-ui-part="view-frame">
  <header data-ui-component="workspace" data-ui-part="view-header">
    {#if back || forward}
      <div data-ui-component="workspace" data-ui-part="view-navigation">
        {#if back}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={back.label}
            disabled={back.disabled}
            onclick={back.onSelect}
          >
            <ArrowLeftIcon data-icon="inline-start" />
          </Button>
        {/if}
        {#if forward}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={forward.label}
            disabled={forward.disabled}
            onclick={forward.onSelect}
          >
            <ArrowRightIcon data-icon="inline-start" />
          </Button>
        {/if}
      </div>
    {/if}

    <div data-ui-component="workspace" data-ui-part="view-title">
      {#if icon}
        {@const Icon = icon}
        <Icon data-workspace-part="view-title-icon" />
      {/if}
      <span>{title}</span>
    </div>

    <div data-ui-component="workspace" data-ui-part="view-header-actions">
      {#each actions as action (action.id)}
        {@const ActionIcon = action.icon}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={action.label}
          aria-pressed={action.pressed}
          disabled={action.disabled}
          onclick={action.onSelect}
        >
          <ActionIcon data-icon="inline-start" />
        </Button>
      {/each}
      {@render options?.()}
    </div>
  </header>

  <div data-ui-component="workspace" data-ui-part="view-body">
    {@render children?.()}
  </div>
</section>

<style>
  [data-ui-component="workspace"][data-ui-part="view-frame"] {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    flex-direction: column;
    overflow: hidden;
    background: var(--background);
  }

  [data-ui-component="workspace"][data-ui-part="view-header"] {
    display: flex;
    width: 100%;
    min-width: 0;
    height: var(--ui-workspace-view-header-height, 2.5rem);
    flex: 0 0 var(--ui-workspace-view-header-height, 2.5rem);
    align-items: center;
    gap: 0.5rem;
    border-bottom: 1px solid
      var(--ui-workspace-view-header-divider, var(--border));
    background: var(--ui-workspace-view-header-background, var(--background));
    padding-inline: 0.75rem;
    color: var(--muted-foreground);
  }

  [data-ui-component="workspace"][data-ui-part="view-navigation"],
  [data-ui-component="workspace"][data-ui-part="view-header-actions"] {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 0.125rem;
  }

  [data-ui-component="workspace"][data-ui-part="view-header-actions"] {
    margin-inline-start: auto;
  }

  [data-ui-component="workspace"][data-ui-part="view-title"] {
    display: flex;
    min-width: 0;
    flex: 1 1 auto;
    align-items: center;
    gap: 0.375rem;
    overflow: hidden;
    color: var(--foreground);
    font-size: 0.875rem;
  }

  [data-ui-component="workspace"][data-ui-part="view-title"] span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  [data-ui-component="workspace"][data-ui-part="view-title"]
    :global([data-workspace-part="view-title-icon"]) {
    width: 0.875rem;
    height: 0.875rem;
    flex: 0 0 auto;
  }

  [data-ui-component="workspace"][data-ui-part="view-body"] {
    position: relative;
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
  }
</style>
