<script lang="ts">
  import WorkspaceAboutDialog from "../about-dialog/WorkspaceAboutDialog.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  const { controller } = getAppShellContext();
</script>

{#if controller.applicationInfo}
  <WorkspaceAboutDialog
    info={controller.applicationInfo}
    open={controller.aboutDialogOpen}
    onOpenChange={(open) => {
      if (open) controller.openAboutDialog();
      else controller.closeAboutDialog();
    }}
    onCopyResult={(success, value) => {
      const label = value === "version" ? "Version" : "Commit hash";
      controller.notices.show(
        success ? `${label} copied` : `Failed to copy ${label.toLowerCase()}`,
      );
    }}
  />
{/if}
