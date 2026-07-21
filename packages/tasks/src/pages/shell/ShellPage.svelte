<script lang="ts">
  import type {
    TasksNavDestinationId,
    TasksViewportId,
  } from "../../lib/contracts.js";
  import TasksPageWorkspace from "../shared/TasksPageWorkspace.svelte";

  let {
    viewport = "desktop",
    startWithDetail = false,
    feedbackMode = "none",
    activeNavId,
    title,
  }: {
    viewport?: TasksViewportId;
    startWithDetail?: boolean;
    feedbackMode?: "none" | "empty" | "loading" | "error";
    activeNavId?: TasksNavDestinationId;
    title?: string;
  } = $props();
</script>

<TasksPageWorkspace
  page="shell"
  {title}
  {activeNavId}
  {viewport}
  initialFilter="all"
  {startWithDetail}
  {feedbackMode}
/>
