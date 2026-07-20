<script lang="ts">
  import type { TasksFilterId, TasksSortId } from "../../lib/contracts.js";
  import TasksFilters from "./TasksFilters.svelte";

  let filterId = $state<TasksFilterId>("all");
  let sortId = $state<TasksSortId>("manual");
  let cleared = $state(false);
</script>

<div style="padding: 1rem">
  <TasksFilters
    {filterId}
    {sortId}
    onFilterChange={(id) => {
      filterId = id;
    }}
    onSortChange={(id) => {
      sortId = id;
    }}
    onClearCompleted={() => {
      cleared = true;
    }}
  />
  <p>Filter {filterId}</p>
  <p>Sort {sortId}</p>
  {#if cleared}
    <p>Cleared completed</p>
  {/if}
</div>
