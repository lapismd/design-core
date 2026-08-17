export const Basic = `<script lang="ts">
  import { WorkspaceIcon } from "@lapismd/design-core/workspace/icon";
</script>

<WorkspaceIcon name="panel-left" />`;

export const Picker = `<script lang="ts">
  import { WorkspaceIconPicker } from "@lapismd/design-core/workspace/icon";

  let icon = $state("notebook-tabs");
</script>

<WorkspaceIconPicker
  value={icon}
  ariaLabel="Workspace icon"
  onValueChange={(next) => (icon = next)}
/>`;
