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
  let displayTitle = $derived(chrome.title ?? tab.title);
  let menuOpen = $state(false);
  let menu = $state(new WorkspaceMenu());
  let editingTitle = $state(false);
  let draftTitle = $state("");
  let cancellingTitleEdit = false;

  function setMenuOpen(open: boolean) {
    menuOpen = open;
    if (open) {
      menu = controller.createPaneMenu(tab.id);
      menu.open = true;
    } else {
      menu.hide();
    }
  }

  function startTitleEdit() {
    cancellingTitleEdit = false;
    draftTitle = displayTitle;
    editingTitle = true;
  }

  async function commitTitleEdit(node: HTMLElement) {
    if (!editingTitle) return;
    if (cancellingTitleEdit) {
      cancellingTitleEdit = false;
      editingTitle = false;
      draftTitle = displayTitle;
      return;
    }
    const next = (node.textContent ?? "").trim();
    editingTitle = false;
    if (!next) {
      draftTitle = displayTitle;
      return;
    }
    draftTitle = next;
    await chrome.onTitleCommit?.(next);
  }

  function onTitleEditorKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      void commitTitleEdit(event.currentTarget as HTMLElement);
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancellingTitleEdit = true;
      (event.currentTarget as HTMLElement).blur();
    }
  }

  function focusTitleEditor(node: HTMLElement) {
    queueMicrotask(() => {
      node.focus();
      const selection = window.getSelection();
      if (!selection) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      selection.removeAllRanges();
      selection.addRange(range);
    });
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
      data-desktop-drag-region="false"
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
      data-desktop-drag-region="false"
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
      <div class="ui-workspace-view-header__path" data-ui-part="path">
        <ol
          class="ui-workspace-view-header__breadcrumbs"
          data-ui-part="breadcrumbs"
          aria-label={`Breadcrumb: ${chromeLabel}`}
        >
          {#each chrome.breadcrumbs as breadcrumb, index (breadcrumb.id)}
            {#if index > 0}
              <li
                class="ui-workspace-view-header__separator"
                aria-hidden="true"
              >
                <ChevronRight />
              </li>
            {/if}
            <li>
              <button
                type="button"
                class="ui-workspace-view-header__breadcrumb"
                data-desktop-drag-region="false"
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
      </div>
      <ChevronRight
        class="ui-workspace-view-header__title-separator"
        aria-hidden="true"
      />
    {/if}
    <div class="ui-workspace-view-header__title-wrap" data-ui-part="title-wrap">
      {#if chrome.titleEditable && editingTitle}
        <div
          class="ui-workspace-view-header__title"
          data-ui-part="title"
          data-editing="true"
          data-desktop-drag-region="false"
          role="textbox"
          tabindex="0"
          aria-label={`Rename ${displayTitle}`}
          contenteditable="true"
          {@attach focusTitleEditor}
          onkeydown={onTitleEditorKeydown}
          onblur={(event) =>
            void commitTitleEdit(event.currentTarget as HTMLElement)}
        >
          {draftTitle}
        </div>
      {:else if chrome.titleEditable}
        <button
          type="button"
          class="ui-workspace-view-header__title"
          data-ui-part="title"
          data-desktop-drag-region="false"
          aria-label={`Rename ${displayTitle}`}
          title={displayTitle}
          onclick={startTitleEdit}
        >
          {displayTitle}
        </button>
      {:else}
        <span class="ui-workspace-view-header__title" data-ui-part="title">
          {displayTitle}
        </span>
      {/if}
    </div>
  </div>

  <div class="ui-workspace-view-header__actions" data-ui-part="actions">
    {#each chrome.actions ?? [] as action (action.id)}
      <button
        type="button"
        class="ui-workspace-view-header__button"
        data-ui-part="action"
        data-desktop-drag-region="false"
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
        data-desktop-drag-region="false"
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
