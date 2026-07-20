<script lang="ts">
  import type { TasksViewportId } from "../../lib/contracts.js";
  import TasksPageWorkspace from "../shared/TasksPageWorkspace.svelte";

  let {
    viewport = "desktop",
    startWithDetail = true,
    feedbackMode = "none",
  }: {
    viewport?: TasksViewportId;
    startWithDetail?: boolean;
    feedbackMode?: "none" | "empty" | "loading" | "error";
  } = $props();
</script>

<TasksPageWorkspace
  page="task-detail"
  title="Task detail"
  {viewport}
  initialFilter="all"
  {startWithDetail}
  {feedbackMode}
/>
