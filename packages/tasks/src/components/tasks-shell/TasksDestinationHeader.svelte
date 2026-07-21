<script lang="ts">
  import EllipsisVerticalIcon from "@lucide/svelte/icons/ellipsis-vertical";
  import ListFilterIcon from "@lucide/svelte/icons/list-filter";
  import PanelRightIcon from "@lucide/svelte/icons/panel-right";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type { TasksFilterId } from "../../lib/contracts.js";
  import { TasksFilters } from "../tasks-filters/index.js";
  import "../../lib/tasks-theme.css";

  type Props = {
    title: string;
    description?: string | null;
    showFilters?: boolean;
    filterId?: TasksFilterId;
    onFilterChange?: (filterId: TasksFilterId) => void;
  };

  let {
    title,
    description = null,
    showFilters = false,
    filterId = "all",
    onFilterChange,
  }: Props = $props();
</script>

<div class="tasks-theme tasks-destination-header" data-tasks-destination-header>
  <div class="tasks-destination-header__title-row">
    <h1 class="tasks-destination-header__title">{title}</h1>
    <div class="tasks-destination-header__utilities" data-tasks-destination-utilities>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Filter">
        <ListFilterIcon aria-hidden="true" />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="More">
        <EllipsisVerticalIcon aria-hidden="true" />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Layout">
        <PanelRightIcon aria-hidden="true" />
      </Button>
    </div>
  </div>

  {#if description}
    <div class="tasks-destination-header__tip" role="note">
      <p>{description}</p>
    </div>
  {/if}

  {#if showFilters}
    <TasksFilters
      {filterId}
      onFilterChange={(id) => onFilterChange?.(id)}
    />
  {/if}
</div>

<style>
  .tasks-destination-header {
    display: grid;
    gap: 0.75rem;
    padding: 1rem 1rem 0.5rem;
    background: transparent;
    color: var(--tasks-ink);
  }

  .tasks-destination-header__title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .tasks-destination-header__title {
    margin: 0;
    font-size: var(--tasks-title-size);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .tasks-destination-header__utilities {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex: none;
  }

  .tasks-destination-header__tip {
    padding: 0.65rem 0.85rem;
    border-radius: var(--tasks-radius-control);
    background: var(--tasks-tip-bg);
    border: 1px solid var(--tasks-tip-border);
    color: var(--tasks-muted-ink);
    font-size: 0.875rem;
    line-height: 1.45;
  }

  .tasks-destination-header__tip p {
    margin: 0;
  }
</style>
