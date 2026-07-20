<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
  import * as ToggleGroup from "@stevejuma/ui/shadcn/toggle-group";
  import type { TasksFilterId, TasksSortId } from "../../lib/contracts.js";
  import "../../lib/tasks-theme.css";

  type FilterOption = { id: TasksFilterId; label: string };

  type Props = {
    filters?: readonly FilterOption[];
    filterId?: TasksFilterId;
    sortId?: TasksSortId;
    onFilterChange?: (filterId: TasksFilterId) => void;
    onSortChange?: (sortId: TasksSortId) => void;
    onClearCompleted?: () => void;
  };

  let {
    filters = [
      { id: "all", label: "All" },
      { id: "for-me", label: "For me" },
      { id: "others", label: "Others" },
      { id: "upcoming", label: "Upcoming" },
      { id: "done", label: "Done" },
    ],
    filterId = "all",
    sortId = "manual",
    onFilterChange,
    onSortChange,
    onClearCompleted,
  }: Props = $props();
</script>

<div class="tasks-theme tasks-filters" data-tasks-filters>
  <ToggleGroup.Root
    type="single"
    value={filterId}
    onValueChange={(value) => {
      if (value) onFilterChange?.(value as TasksFilterId);
    }}
    aria-label="Task filters"
  >
    {#each filters as filter (filter.id)}
      <ToggleGroup.Item value={filter.id} aria-label={filter.label}>
        {filter.label}
      </ToggleGroup.Item>
    {/each}
  </ToggleGroup.Root>

  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button {...props} type="button" variant="outline" size="sm">
          Sort
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.RadioGroup
        value={sortId}
        onValueChange={(value) => onSortChange?.(value as TasksSortId)}
      >
        <DropdownMenu.RadioItem value="manual">Manual</DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem value="due">Due</DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem value="priority"
          >Priority</DropdownMenu.RadioItem
        >
        <DropdownMenu.RadioItem value="title">Title</DropdownMenu.RadioItem>
      </DropdownMenu.RadioGroup>
      <DropdownMenu.Separator />
      <DropdownMenu.Item
        variant="destructive"
        onSelect={() => onClearCompleted?.()}
      >
        Clear completed
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>

<style>
  .tasks-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    border-radius: var(--tasks-radius-control);
    background: var(--tasks-surface);
    color: var(--tasks-ink);
  }
</style>
