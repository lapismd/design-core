export const Basic = `<script lang="ts">
  import { WorkspaceEmpty } from "@lapismd/design-core/workspace/empty";

  const emptyActions = [
    { id: "new", label: "Create new note", onSelect: () => {} },
  ];
</script>

<WorkspaceEmpty actions={emptyActions} />`;
