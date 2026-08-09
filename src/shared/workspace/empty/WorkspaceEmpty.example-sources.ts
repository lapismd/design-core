export const Basic = `<script lang="ts">
  import { WorkspaceEmpty } from "@lapismd/design-core/workspace/empty";

  const emptyActions = [
    {
      id: "create-tab",
      label: "Create Tab",
      icon: "file-plus",
      onSelect: () => {},
    },
    {
      id: "open-command-palette",
      label: "Open Command Palette",
      icon: "terminal",
      onSelect: () => {},
    },
  ];
  const sidebarLinks = [
    { id: "files", label: "Files", icon: "files", onSelect: () => {} },
    { id: "search", label: "Search", icon: "search", onSelect: () => {} },
  ];
</script>

<WorkspaceEmpty actions={emptyActions} links={sidebarLinks} />`;
