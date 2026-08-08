<script lang="ts">
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import Ellipsis from "@lucide/svelte/icons/ellipsis";
  import { DropdownMenu } from "bits-ui";
  import type { WorkspaceTab } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { WorkspaceMenu } from "../core/workspace-menu.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceMenuItems from "../menu/WorkspaceMenuItems.svelte";
  import "./WorkspaceViewHeader.css";

  let {
    controller,
    tab,
    hostId,
    paneId,
  }: {
    controller: WorkspaceShellController;
    tab: WorkspaceTab;
    hostId: string;
    paneId: string;
  } = $props();

  let definition = $derived(controller.registry.resolve(tab.view.type));
  let context = $derived({
    tab,
    hostId,
    paneId,
    active: controller.activeTabId === tab.id,
    showInlineTitle: controller.showInlineTitle,
    activate: () => controller.selectTab(tab.id),
    close: () => controller.closeTab(tab.id),
    setState: (state: Record<string, unknown>) =>
      controller.updateViewState(tab.id, state),
  });
  let chrome = $derived(definition?.getChrome?.(context) ?? {});
  let chromeLabel = $derived((chrome.title ?? tab.title) || tab.id);
  let menuOpen = $state(false);
  let menu = $state(new WorkspaceMenu());

  function setMenuOpen(open: boolean) {
    menuOpen = open;
    if (open) {
      menu = controller.createPaneMenu(tab.id);
      menu.open = true;
    } else {
      menu.hide();
    }
  }
</script>

<header
  class="ui-workspace-view-header"
  data-ui-component="workspace-view-header"
  data-ui-part="root"
  data-workspace-view-header={tab.id}
>
  <nav
    class="ui-workspace-view-header__navigation"
    aria-label={`View history: ${chromeLabel}`}
  >
    <button
      type="button"
      class="ui-workspace-view-header__button"
      data-ui-part="back"
      data-hint-target="view-header-action"
      data-hint-group="view-header"
      data-hint-action="click"
      data-hint-target-id={`view-header:${tab.id}:back`}
      data-hint-label="Back"
      aria-label="Back"
      title="Back"
      disabled={!chrome.canGoBack}
      onclick={() => chrome.onGoBack?.()}
    >
      <ArrowLeft aria-hidden="true" />
    </button>
    <button
      type="button"
      class="ui-workspace-view-header__button"
      data-ui-part="forward"
      data-hint-target="view-header-action"
      data-hint-group="view-header"
      data-hint-action="click"
      data-hint-target-id={`view-header:${tab.id}:forward`}
      data-hint-label="Forward"
      aria-label="Forward"
      title="Forward"
      disabled={!chrome.canGoForward}
      onclick={() => chrome.onGoForward?.()}
    >
      <ArrowRight aria-hidden="true" />
    </button>
  </nav>

  <div
    class="ui-workspace-view-header__title-container"
    data-ui-part="title-container"
    data-desktop-drag-region
  >
    {#if chrome.breadcrumbs?.length}
      <ol
        class="ui-workspace-view-header__breadcrumbs"
        data-ui-part="breadcrumbs"
        aria-label={`Breadcrumb: ${chromeLabel}`}
      >
        {#each chrome.breadcrumbs as breadcrumb, index (breadcrumb.id)}
          {#if index > 0}
            <li class="ui-workspace-view-header__separator" aria-hidden="true">
              <ChevronRight />
            </li>
          {/if}
          <li>
            <button
              type="button"
              class="ui-workspace-view-header__breadcrumb"
              data-hint-target="view-header-breadcrumb"
              data-hint-group="view-header"
              data-hint-action="click"
              data-hint-target-id={`view-header:${tab.id}:breadcrumb:${breadcrumb.id}`}
              data-hint-label={breadcrumb.label}
              onclick={() => breadcrumb.onSelect?.()}
            >
              {breadcrumb.label}
            </button>
          </li>
        {/each}
      </ol>
      <ChevronRight
        class="ui-workspace-view-header__title-separator"
        aria-hidden="true"
      />
    {/if}
    <span class="ui-workspace-view-header__title" data-ui-part="title">
      {chrome.title ?? tab.title}
    </span>
  </div>

  <div class="ui-workspace-view-header__actions" data-ui-part="actions">
    {#each chrome.actions ?? [] as action (action.id)}
      <button
        type="button"
        class="ui-workspace-view-header__button"
        data-ui-part="action"
        data-hint-target="view-header-action"
        data-hint-group="view-header"
        data-hint-action="click"
        data-hint-target-id={`view-header:${tab.id}:action:${action.id}`}
        data-hint-label={action.label}
        disabled={action.disabled}
        title={action.label}
        aria-label={action.label}
        onclick={(event) => action.onSelect(event)}
      >
        <WorkspaceIcon name={action.icon} />
      </button>
    {/each}

    <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenu.Trigger
        class="ui-workspace-view-header__button"
        data-ui-part="menu-trigger"
        data-hint-target="view-header-action"
        data-hint-group="view-header"
        data-hint-action="click"
        data-hint-target-id={`view-header:${tab.id}:menu`}
        data-hint-label="More options"
        aria-label="More options"
        title="More options"
      >
        <Ellipsis aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          class="ui-workspace-menu__content"
          data-ui-component="workspace-menu"
          data-ui-part="content"
          align="end"
          sideOffset={4}
        >
          <WorkspaceMenuItems {menu} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  </div>
</header>
