<script lang="ts">
  import { Button } from "../../shadcn/button/index.js";
  import * as Sheet from "../../shadcn/sheet/index.js";
  import type { AppShellController } from "../core/app-shell-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import type { WorkspaceSettingsController } from "./settings-controller.svelte.js";
  import AppSettingsContent from "./AppSettingsContent.svelte";
  import AppSettingsNavigation from "./AppSettingsNavigation.svelte";
  import AppSettingsRoot from "./AppSettingsRoot.svelte";
  import AppSettingsSearch from "./AppSettingsSearch.svelte";

  let {
    controller,
    app,
  }: {
    controller: WorkspaceSettingsController;
    app?: AppShellController;
  } = $props();

  let navigationOpen = $state(false);
  let selectedSection = $derived(
    controller.sections.find(
      (section) => section.id === controller.selectedSectionId,
    ) ?? controller.sections[0],
  );
</script>

<AppSettingsRoot {controller} {app}>
  <aside
    class="ui-workspace-settings__sidebar"
    data-ui-part="settings-sidebar"
    aria-label="Settings navigation"
  >
    <AppSettingsSearch />
    <AppSettingsNavigation />
  </aside>
  <div
    class="ui-workspace-settings__mobile-toolbar"
    data-ui-part="settings-mobile-toolbar"
  >
    <Sheet.Root bind:open={navigationOpen}>
      <Sheet.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            class="ui-workspace-settings__mobile-navigation-trigger"
            variant="ghost"
            size="sm"
            aria-label="Open settings navigation"
          >
            <WorkspaceIcon name="panel-left" data-icon="inline-start" />
            <span>{selectedSection?.title ?? "Settings"}</span>
          </Button>
        {/snippet}
      </Sheet.Trigger>
      <Sheet.Content
        side="left"
        class="ui-workspace-settings__mobile-sheet"
        aria-label="Settings navigation"
      >
        <Sheet.Header class="sr-only">
          <Sheet.Title>Settings navigation</Sheet.Title>
          <Sheet.Description>
            Search settings and choose a settings section.
          </Sheet.Description>
        </Sheet.Header>
        <div
          class="ui-workspace-settings__mobile-sheet-body"
          data-ui-part="settings-mobile-sheet-body"
        >
          <AppSettingsSearch />
          <AppSettingsNavigation onselect={() => (navigationOpen = false)} />
        </div>
      </Sheet.Content>
    </Sheet.Root>
  </div>
  <AppSettingsContent />
</AppSettingsRoot>
