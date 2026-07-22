<script lang="ts">
  import BellIcon from "@lucide/svelte/icons/bell";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import CircleUserRoundIcon from "@lucide/svelte/icons/circle-user-round";
  import InboxIcon from "@lucide/svelte/icons/inbox";
  import ListIcon from "@lucide/svelte/icons/list";
  import ListTodoIcon from "@lucide/svelte/icons/list-todo";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import StarIcon from "@lucide/svelte/icons/star";
  import type { Component } from "svelte";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
  import type {
    TasksNavDestination,
    TasksNavDestinationId,
  } from "../../lib/contracts.js";
  import "../../lib/tasks-theme.css";

  type Props = {
    destinations: readonly TasksNavDestination[];
    activeId?: TasksNavDestinationId | null;
    onActivate?: (id: TasksNavDestinationId) => void;
    onFavourite?: (listId: string, favourite: boolean) => void;
    onCreateList?: () => void;
  };

  let {
    destinations,
    activeId = null,
    onActivate,
    onFavourite,
    onCreateList,
  }: Props = $props();

  /** White-label Lucide glyphs for the fixed system destinations only. */
  const systemIcons: Partial<Record<TasksNavDestinationId, Component>> = {
    inbox: InboxIcon,
    today: CalendarIcon,
    tasks: ListTodoIcon,
    updates: BellIcon,
    lists: ListIcon,
  };

  const system = $derived(
    destinations.filter((item) => item.kind === "system"),
  );
  const favouriteLists = $derived(
    destinations.filter((item) => item.kind === "list" && item.favourite),
  );
  const otherLists = $derived(
    destinations.filter((item) => item.kind === "list" && !item.favourite),
  );

  function iconFor(id: TasksNavDestinationId): Component | undefined {
    return systemIcons[id];
  }

  function itemClass(id: TasksNavDestinationId): string {
    return activeId === id
      ? "tasks-list-navigation__item tasks-list-navigation__item--active"
      : "tasks-list-navigation__item";
  }

  function countClass(item: TasksNavDestination): string {
    const base = "tasks-list-navigation__count";
    if (item.id === "updates" && (item.count ?? 0) > 0) {
      return `${base} tasks-list-navigation__count--accent`;
    }
    return base;
  }
</script>

{#snippet navItem(item: TasksNavDestination, listRow = false)}
  {@const Icon = listRow ? undefined : iconFor(item.id)}
  {#if listRow}
    <li class="tasks-list-navigation__list-row">
      <Button
        type="button"
        variant="ghost"
        class={itemClass(item.id)}
        aria-current={activeId === item.id ? "page" : undefined}
        onclick={() => onActivate?.(item.id)}
      >
        <span class="tasks-list-navigation__label">{item.label}</span>
      </Button>
      {#if item.listId}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-pressed={item.favourite ?? false}
          aria-label={`Favourite ${item.label}`}
          onclick={() =>
            onFavourite?.(item.listId!, !(item.favourite ?? false))}
        >
          <StarIcon aria-hidden="true" />
        </Button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Button
                {...props}
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${item.label}`}
              >
                ⋯
              </Button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={() => onActivate?.(item.id)}>
              Open
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      {/if}
    </li>
  {:else}
    <li>
      <Button
        type="button"
        variant="ghost"
        class={itemClass(item.id)}
        aria-current={activeId === item.id ? "page" : undefined}
        onclick={() => onActivate?.(item.id)}
      >
        {#if Icon}
          <Icon aria-hidden="true" class="tasks-list-navigation__icon" />
        {/if}
        <span class="tasks-list-navigation__label">{item.label}</span>
        {#if item.count !== undefined}
          <span class={countClass(item)} aria-hidden="true">{item.count}</span>
        {/if}
      </Button>
    </li>
  {/if}
{/snippet}

<nav
  class="tasks-theme tasks-list-navigation"
  data-tasks-list-navigation
  aria-label="Tasks navigation"
>
  <div class="tasks-list-navigation__scroll">
    <ul class="tasks-list-navigation__section">
      {#each system as item (item.id)}
        {@render navItem(item)}
      {/each}
    </ul>

    <div data-tasks-nav-lists>
      <div class="tasks-list-navigation__section-head">
        <h2>Favorites</h2>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="New list"
          onclick={() => onCreateList?.()}
        >
          <PlusIcon aria-hidden="true" />
        </Button>
      </div>

      {#if favouriteLists.length > 0}
        <ul class="tasks-list-navigation__section">
          {#each favouriteLists as item (item.id)}
            {@render navItem(item, true)}
          {/each}
        </ul>
      {/if}

      {#if otherLists.length > 0}
        <h2 class="tasks-list-navigation__subhead">Lists</h2>
        <ul class="tasks-list-navigation__section">
          {#each otherLists as item (item.id)}
            {@render navItem(item, true)}
          {/each}
        </ul>
      {/if}
    </div>
  </div>

  <div class="tasks-list-navigation__account" data-tasks-nav-account>
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      class="tasks-list-navigation__account-btn"
      aria-label="New"
    >
      <PlusIcon aria-hidden="true" />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      class="tasks-list-navigation__avatar-btn"
      aria-label="Account"
    >
      <CircleUserRoundIcon aria-hidden="true" />
    </Button>
  </div>
</nav>

<style>
  .tasks-list-navigation {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 0.25rem 0;
    background: transparent;
    color: var(--tasks-ink);
  }

  .tasks-list-navigation__scroll {
    display: grid;
    align-content: start;
    gap: 0.5rem;
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .tasks-list-navigation__section {
    display: grid;
    gap: 0.125rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .tasks-list-navigation__section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem 0.5rem 0.125rem;
  }

  .tasks-list-navigation__section-head h2,
  .tasks-list-navigation__subhead {
    margin: 0;
    font-size: var(--tasks-section-label-size);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--tasks-muted-ink);
  }

  .tasks-list-navigation__subhead {
    padding: 0.375rem 0.5rem 0;
  }

  .tasks-list-navigation__list-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 0.125rem;
  }

  :global(.tasks-list-navigation__item) {
    position: relative;
    justify-content: flex-start;
    gap: 0.5rem;
    width: 100%;
    min-height: var(--tasks-nav-item-height);
    padding-left: 0.75rem;
    padding-right: 0.5rem;
    border-radius: var(--tasks-radius-control);
    font-weight: 500;
  }

  :global(.tasks-list-navigation__icon) {
    flex: none;
    width: 1rem;
    height: 1rem;
    color: var(--tasks-muted-ink);
  }

  :global(.tasks-list-navigation__item--active .tasks-list-navigation__icon) {
    color: var(--tasks-ink);
  }

  :global(.tasks-list-navigation__item--active) {
    background: var(--tasks-selection);
    color: var(--tasks-ink);
  }

  :global(.tasks-list-navigation__item--active)::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.5rem;
    bottom: 0.5rem;
    width: 2px;
    border-radius: var(--tasks-radius-pill);
    background: var(--tasks-accent);
  }

  .tasks-list-navigation__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  .tasks-list-navigation__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.375rem;
    height: 1.25rem;
    padding: 0 0.35rem;
    border-radius: var(--tasks-radius-pill);
    background: var(--tasks-surface-raised);
    color: var(--tasks-muted-ink);
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1;
  }

  .tasks-list-navigation__count--accent {
    background: var(--tasks-selection);
    color: var(--tasks-accent);
  }

  .tasks-list-navigation__account {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: none;
    gap: 0.5rem;
    padding: 0.5rem 0.5rem 0.25rem;
  }

  :global(.tasks-list-navigation__account-btn),
  :global(.tasks-list-navigation__avatar-btn) {
    border-radius: var(--tasks-radius-pill);
    background: var(--tasks-surface-raised);
  }

  :global(.tasks-list-navigation__avatar-btn) {
    color: var(--tasks-muted-ink);
  }
</style>
