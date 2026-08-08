export const Basic = `<script lang="ts">
  import { WorkspaceSidebarEmpty } from "@lapismd/design-core/workspace/sidebar-empty";

  function closeLeftSidebar() {
    // host closes the sidebar / empties the dock
  }
</script>

<WorkspaceSidebarEmpty side="left" onClose={closeLeftSidebar} />`;
