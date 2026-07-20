<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type {
    WorkspaceAction,
    WorkspaceViewBreadcrumb,
    WorkspaceViewNavigationAction,
  } from "../core/types.js";

  let {
    title,
    icon,
    breadcrumbs = [],
    back,
    forward,
    actions = [],
    options,
  }: {
    title: string;
    /** Optional icon displayed before the view title. */
    icon?: Component;
    /** Optional parent locations shown before the current view title. */
    breadcrumbs?: readonly WorkspaceViewBreadcrumb[];
    back?: WorkspaceViewNavigationAction;
    forward?: WorkspaceViewNavigationAction;
    actions?: readonly WorkspaceAction[];
    /** Consumer-owned menu or controls displayed after the header actions. */
    options?: Snippet;
  } = $props();
</script>

<header data-ui-component="workspace" data-ui-part="view-header">
  {#if back || forward}
    <nav
      data-ui-component="workspace"
      data-ui-part="view-navigation"
      aria-label="View navigation"
    >
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
    </nav>
  {/if}

  <div data-ui-component="workspace" data-ui-part="view-title-container">
    {#if breadcrumbs.length}
      <nav
        data-ui-component="workspace"
        data-ui-part="view-breadcrumbs"
        aria-label="View location"
      >
        {#each breadcrumbs as breadcrumb (breadcrumb.id ?? breadcrumb.label)}
          {#if breadcrumb.onSelect}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={breadcrumb.disabled}
              onclick={breadcrumb.onSelect}
            >
              {breadcrumb.label}
            </Button>
          {:else}
            <span data-ui-component="workspace" data-ui-part="view-breadcrumb">
              {breadcrumb.label}
            </span>
          {/if}
          <ChevronRightIcon
            data-ui-component="workspace"
            data-ui-part="breadcrumb-separator"
          />
        {/each}
      </nav>
    {/if}

    <div data-ui-component="workspace" data-ui-part="view-title">
      {#if icon}
        {@const Icon = icon}
        <Icon data-workspace-part="view-title-icon" />
      {/if}
      <span>{title}</span>
    </div>
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

<style>
  [data-ui-component="workspace"][data-ui-part="view-header"] {
    display: flex;
    width: 100%;
    min-width: 0;
    height: var(--ui-workspace-view-header-height, 2.5rem);
    flex: 0 0 var(--ui-workspace-view-header-height, 2.5rem);
    align-items: center;
    gap: 0.5rem;
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

  [data-ui-component="workspace"][data-ui-part="view-title-container"] {
    display: flex;
    min-width: 0;
    flex: 1 1 auto;
    align-items: center;
    overflow: hidden;
    font-size: 0.875rem;
  }

  [data-ui-component="workspace"][data-ui-part="view-breadcrumbs"] {
    display: flex;
    min-width: 0;
    flex: 0 1 auto;
    align-items: center;
    overflow: hidden;
    color: var(--muted-foreground);
    white-space: nowrap;
  }

  [data-ui-component="workspace"][data-ui-part="view-breadcrumbs"]
    :global(button) {
    min-width: 0;
    height: 1.75rem;
    padding-inline: 0.25rem;
    color: inherit;
  }

  [data-ui-component="workspace"][data-ui-part="view-breadcrumb"] {
    overflow: hidden;
    padding-inline: 0.25rem;
    text-overflow: ellipsis;
  }

  :global([data-ui-part="breadcrumb-separator"]) {
    width: 0.875rem;
    height: 0.875rem;
    flex: 0 0 auto;
  }

  [data-ui-component="workspace"][data-ui-part="view-title"] {
    display: flex;
    min-width: 0;
    flex: 0 1 auto;
    align-items: center;
    gap: 0.375rem;
    overflow: hidden;
    color: var(--foreground);
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

  [data-ui-component="workspace"][data-ui-part="view-header"]
    :global(button:hover:not(:disabled)) {
    background: var(--ui-workspace-action-hover, var(--accent));
  }
</style>
