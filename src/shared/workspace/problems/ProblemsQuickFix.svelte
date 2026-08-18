<script lang="ts">
  import { DropdownMenu } from "bits-ui";
  import type { WorkspaceMenu } from "../core/workspace-menu.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceMenuItems from "../menu/WorkspaceMenuItems.svelte";

  let {
    menu,
    severityIcon,
  }: {
    menu: WorkspaceMenu;
    severityIcon: string;
  } = $props();

  function stopRowActivation(event: Event) {
    event.stopPropagation();
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class="ui-workspace-problems__quick-fix"
    aria-label="Quick fix"
    title="Quick fix"
    onclick={stopRowActivation}
    onpointerdown={stopRowActivation}
    onkeydown={stopRowActivation}
  >
    <WorkspaceIcon
      class="ui-workspace-problems__severity"
      name={severityIcon}
    />
    <WorkspaceIcon
      class="ui-workspace-problems__lightbulb"
      name="lightbulb"
    />
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      class="ui-workspace-menu__content"
      data-ui-component="workspace-menu"
      data-ui-part="content"
      align="start"
      side="top"
      sideOffset={4}
      strategy="fixed"
      collisionBoundary={[]}
      onpointerdown={stopRowActivation}
    >
      <WorkspaceMenuItems {menu} />
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
