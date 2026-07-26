<script lang="ts">
  import { getAppShellContext } from "./app-shell-context.svelte.js";
  import WorkspaceAboutDialog from "../about-dialog/WorkspaceAboutDialog.svelte";
  import WorkspaceCommandPalette from "../command-palette/WorkspaceCommandPalette.svelte";
  import AppShellNoticeToasts from "./AppShellNoticeToasts.svelte";

  const { controller } = getAppShellContext();
  let { portalTarget }: { portalTarget: HTMLElement } = $props();
</script>

<div class="ui-app-shell__overlay-layer" data-ui-part="overlay-layer">
  <AppShellNoticeToasts app={controller} />
  <WorkspaceCommandPalette app={controller} />
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
  {#each controller.ui.overlays as overlay (overlay.id)}
    {@const OverlayComponent = overlay.component}
    <OverlayComponent app={controller} {portalTarget} {...overlay.props} />
  {/each}
</div>
