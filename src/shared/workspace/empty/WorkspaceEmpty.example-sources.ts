export const Basic = `<script lang="ts">
  import { WorkspaceEmpty } from "@lapismd/design-core/workspace/empty";

  const emptyActions = [
    { id: "create-tab", label: "Create Tab", onSelect: () => {} },
    {
      id: "open-command-palette",
      label: "Open Command Palette",
      onSelect: () => {},
    },
  ];
  const sidebarLinks = [
    { id: "files", label: "Files", onSelect: () => {} },
    { id: "search", label: "Search", onSelect: () => {} },
  ];
</script>

<WorkspaceEmpty actions={emptyActions} links={sidebarLinks} />`;
