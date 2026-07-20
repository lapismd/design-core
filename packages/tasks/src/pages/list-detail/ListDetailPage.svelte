<script lang="ts">
  import type { TasksViewportId } from "../../lib/contracts.js";
  import TasksPageWorkspace from "../shared/TasksPageWorkspace.svelte";

  let {
    viewport = "desktop",
    startWithDetail = false,
    feedbackMode = "none",
  }: {
    viewport?: TasksViewportId;
    startWithDetail?: boolean;
    feedbackMode?: "none" | "empty" | "loading" | "error";
  } = $props();
</script>

<TasksPageWorkspace
  page="list-detail"
  title="List detail"
  {viewport}
  initialFilter="all"
  {startWithDetail}
  {feedbackMode}
/>
