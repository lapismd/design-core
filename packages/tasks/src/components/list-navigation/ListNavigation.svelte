<script lang="ts">
  import StarIcon from "@lucide/svelte/icons/star";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
  import { Separator } from "@stevejuma/ui/shadcn/separator";
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

  const system = $derived(
    destinations.filter((item) => item.kind === "system"),
  );
  const lists = $derived(destinations.filter((item) => item.kind === "list"));
</script>

<nav
  class="tasks-theme tasks-list-navigation"
  data-tasks-list-navigation
  aria-label="Tasks navigation"
>
  <ul class="tasks-list-navigation__section">
    {#each system as item (item.id)}
      <li>
        <Button
          type="button"
          variant={activeId === item.id ? "secondary" : "ghost"}
          class="tasks-list-navigation__item"
          aria-current={activeId === item.id ? "page" : undefined}
          onclick={() => onActivate?.(item.id)}
        >
          {item.label}
        </Button>
      </li>
    {/each}
  </ul>

  <Separator />

  <div class="tasks-list-navigation__lists-head">
    <h2>Lists</h2>
    <Button
      type="button"
      size="sm"
      variant="outline"
      onclick={() => onCreateList?.()}
    >
      New list
    </Button>
  </div>

  <ul class="tasks-list-navigation__section">
    {#each lists as item (item.id)}
      <li class="tasks-list-navigation__list-row">
        <Button
          type="button"
          variant={activeId === item.id ? "secondary" : "ghost"}
          class="tasks-list-navigation__item"
          aria-current={activeId === item.id ? "page" : undefined}
          onclick={() => onActivate?.(item.id)}
        >
          {item.label}
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
    {/each}
  </ul>
</nav>

<style>
  .tasks-list-navigation {
    display: grid;
    gap: 0.75rem;
    width: min(100%, var(--tasks-sidebar-width));
    padding: 0.75rem;
    border-radius: var(--tasks-radius-shell);
    background: var(--tasks-shell);
    color: var(--tasks-ink);
  }

  .tasks-list-navigation__section {
    display: grid;
    gap: 0.2rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .tasks-list-navigation__lists-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .tasks-list-navigation__lists-head h2 {
    margin: 0;
    font-size: 0.8rem;
    text-transform: uppercase;
    color: var(--tasks-muted-ink);
  }

  .tasks-list-navigation__list-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 0.15rem;
  }

  :global(.tasks-list-navigation__item) {
    justify-content: flex-start;
    width: 100%;
  }
</style>
