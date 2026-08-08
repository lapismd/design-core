export const Loading = `<script lang="ts">
  import {
    WorkspaceStartup,
    type WorkspaceStartupTask,
  } from "@lapismd/design-core/workspace/startup";

  const tasks: WorkspaceStartupTask[] = [
    { id: "vault", label: "Loading file system", status: "complete" },
    { id: "config", label: "Loading configuration", status: "complete" },
    { id: "plugins", label: "Loading core plugins", status: "active" },
    { id: "layout", label: "Loading layout", status: "pending" },
  ];
</script>

<WorkspaceStartup title="Starting Lapis Notes" {tasks} />`;

export const Failure = `<script lang="ts">
  import { WorkspaceStartup } from "@lapismd/design-core/workspace/startup";

  const tasks = [
    { id: "vault", label: "Loading file system", status: "complete" },
    { id: "plugins", label: "Loading core plugins", status: "failed" },
  ];
</script>

<WorkspaceStartup
  title="Starting Lapis Notes"
  {tasks}
  failure={{
    title: "App startup failed",
    description: "The workspace stopped while loading core plugins.",
    actions: [{ id: "retry", label: "Retry", onSelect: () => {} }],
  }}
/>`;
