<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Input } from "@lapismd/design-core/shadcn/input";
  import { ScrollArea } from "@lapismd/design-core/shadcn/scroll-area";
  import { Collapsible, ContextMenu, DropdownMenu } from "bits-ui";
  import { onMount, tick } from "svelte";
  import type { WorkspaceMenu } from "../core/workspace-menu.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceContextMenuItems from "../menu/WorkspaceContextMenuItems.svelte";
  import WorkspaceMenuItems from "../menu/WorkspaceMenuItems.svelte";
  import type { ExplorerController } from "./explorer-controller.svelte.js";
  import type { ExplorerNode } from "./types.js";
  import "./WorkspaceExplorer.css";

  let {
    controller,
  }: {
    controller: ExplorerController;
  } = $props();

  let rootEl = $state<HTMLElement | null>(null);
  let sortMenu = $state<WorkspaceMenu | null>(null);
  let sortMenuOpen = $state(false);
  let flashTimeout: ReturnType<typeof setTimeout> | null = null;

  const labels = $derived(controller.labels);
  const rootMenu = $derived(controller.createItemMenu(controller.root));

  onMount(() => {
    const stop = controller.start();
    return () => {
      if (flashTimeout !== null) clearTimeout(flashTimeout);
      stop();
    };
  });

  $effect(() => {
    const reveal = controller.revealState;
    if (!reveal.path || !reveal.isFlashing) return;
    void tick().then(() => {
      requestAnimationFrame(() => {
        const el = rootEl?.querySelector(
          `[data-path=${JSON.stringify(reveal.path)}]`,
        ) as HTMLElement | null;
        el?.scrollIntoView({ block: "center", inline: "nearest" });
        if (flashTimeout !== null) clearTimeout(flashTimeout);
        flashTimeout = setTimeout(() => {
          controller.clearRevealFlash();
          el?.focus();
        }, 2000);
      });
    });
  });

  function openSortMenu() {
    sortMenu = controller.createSortMenu();
    sortMenuOpen = true;
  }

  function focusRename(node: HTMLElement) {
    const input = node.querySelector("input");
    if (!input) return;
    const value = input.value || "";
    const pos = value.lastIndexOf(".");
    queueMicrotask(() => {
      input.focus();
      if (pos > 0) input.setSelectionRange(0, pos);
      else input.select();
    });
    return {
      destroy() {},
    };
  }

  function onRowKeydown(event: KeyboardEvent, node: ExplorerNode) {
    if (event.code === "Enter") {
      event.preventDefault();
      controller.beginRename(node.path);
      void tick().then(() => {
        const el = rootEl?.querySelector(
          `[data-path=${JSON.stringify(node.path)}]`,
        ) as HTMLElement | null;
        if (el) focusRename(el);
      });
    }
  }

  function onDragStart(event: DragEvent, node: ExplorerNode) {
    if (node.kind !== "file" || !event.dataTransfer) return;
    event.dataTransfer.setData("text/plain", node.path);
    event.dataTransfer.effectAllowed = "move";
    controller.draggingPath = node.path;
    controller.dropTargetPath = dirnameOf(node.path);
    controller.onFileDragStart?.(node, event);
  }

  function dirnameOf(path: string): string {
    const index = path.lastIndexOf("/");
    return index === -1 ? "" : path.slice(0, index);
  }

  function onDragEnter(event: DragEvent, folderPath: string) {
    event.stopPropagation();
    const current = event.currentTarget as HTMLElement;
    if (current.contains(event.relatedTarget as Node)) return;
    controller.dropTargetPath = folderPath;
  }

  function onDragLeave(event: DragEvent) {
    // Row leave does not clear the target — body/folder enter handlers own it.
    event.stopPropagation();
  }

  function onDragOver(event: DragEvent, folderPath: string) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    if (folderPath) controller.setExpanded(folderPath, true);
    controller.dropTargetPath = folderPath;
  }

  async function onDrop(event: DragEvent, folderPath: string) {
    event.preventDefault();
    event.stopPropagation();
    controller.dropTargetPath = null;
    const draggingPath = controller.draggingPath;
    controller.draggingPath = null;
    if (!event.dataTransfer) return;
    const files = Array.from(event.dataTransfer.files);
    if (files.length) {
      await controller.importExternalFiles(folderPath, files);
      return;
    }
    const path =
      event.dataTransfer.getData("text/plain") || draggingPath || "";
    if (!path || path === folderPath) return;
    if (folderPath && path.startsWith(`${folderPath}/`)) return;
    await controller.moveNode(path, folderPath);
  }

  function onBodyPointerDown(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest("[data-path], .ui-workspace-explorer__row")) return;
    controller.selectRoot();
  }

  function onBodyDragEnter(event: DragEvent) {
    const current = event.currentTarget as HTMLElement;
    if (current.contains(event.relatedTarget as Node)) return;
    controller.dropTargetPath = "";
  }

  function onBodyDragLeave(event: DragEvent) {
    const current = event.currentTarget as HTMLElement;
    if (current.contains(event.relatedTarget as Node)) return;
    controller.dropTargetPath = null;
  }

  function onBodyDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    if ((event.target as HTMLElement | null)?.closest("[data-path]")) return;
    controller.dropTargetPath = "";
  }

  function rowClass(node: ExplorerNode): string {
    const parts = ["ui-workspace-explorer__row"];
    if (
      controller.revealState.isFlashing &&
      controller.revealState.path === node.path
    ) {
      parts.push("is-flashing");
    }
    return parts.join(" ");
  }
</script>

{#snippet Tree({ node }: { node: ExplorerNode })}
  {@const menu = controller.createItemMenu(node)}
  {#if node.kind === "file"}
    <li class="ui-workspace-explorer__item">
      {#if controller.editingPath === node.path}
        <div
          class={rowClass(node)}
          data-path={node.path}
          data-active={node.path === controller.selectedPath}
        >
          <WorkspaceIcon name={controller.iconFor(node, true)} />
          <span class="ui-workspace-explorer__rename" use:focusRename>
            <Input
              class="ui-workspace-explorer__rename-input"
              value={node.name}
              data-path={node.path}
              aria-label={labels.rename}
              onkeydown={(event) => {
                if (event.code === "Enter") {
                  event.preventDefault();
                  void controller.commitRename(
                    node.path,
                    (event.currentTarget as HTMLInputElement).value,
                  );
                }
                if (event.code === "Escape") {
                  controller.cancelRename();
                }
              }}
              onblur={(event) =>
                void controller.commitRename(
                  node.path,
                  (event.currentTarget as HTMLInputElement).value,
                )}
            />
          </span>
        </div>
      {:else}
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            {#snippet child({ props })}
              <button
                {...props}
                type="button"
                class={rowClass(node)}
                data-path={node.path}
                data-active={node.path === controller.selectedPath}
                data-hint-target="file-item"
                data-hint-group="file-explorer"
                draggable="true"
                onclick={() => void controller.openFile(node.path)}
                onkeydown={(event) => onRowKeydown(event, node)}
                ondragstart={(event) => onDragStart(event, node)}
                ondragend={() => {
                  controller.dropTargetPath = null;
                  controller.draggingPath = null;
                }}
                ondragenter={(event) =>
                  onDragEnter(event, dirnameOf(node.path))}
                ondragleave={onDragLeave}
              >
                <WorkspaceIcon name={controller.iconFor(node, false)} />
                <span class="ui-workspace-explorer__title">{node.name}</span>
              </button>
            {/snippet}
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content
              class="ui-workspace-menu__content"
              data-ui-component="workspace-menu"
              data-ui-part="content"
            >
              <WorkspaceContextMenuItems {menu} />
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      {/if}
    </li>
  {:else}
    <li class="ui-workspace-explorer__item">
      <Collapsible.Root
        class="ui-workspace-explorer__folder"
        data-drop={node.path === controller.dropTargetPath ? "true" : undefined}
        data-state={controller.isExpanded(node.path) ? "open" : "closed"}
        open={controller.isExpanded(node.path)}
        onOpenChange={(open) => controller.setExpanded(node.path, open)}
      >
        <ContextMenu.Root>
          {#if controller.editingPath === node.path}
            <div
              class={rowClass(node)}
              data-path={node.path}
              data-active={node.path === controller.selectedPath}
            >
              <WorkspaceIcon
                name="chevron-right"
                class="ui-workspace-explorer__chevron"
              />
              <WorkspaceIcon name={controller.iconFor(node, true)} />
              <span class="ui-workspace-explorer__rename" use:focusRename>
                <Input
                  class="ui-workspace-explorer__rename-input"
                  value={node.name}
                  data-path={node.path}
                  aria-label={labels.rename}
                  onkeydown={(event) => {
                    if (event.code === "Enter") {
                      event.preventDefault();
                      void controller.commitRename(
                        node.path,
                        (event.currentTarget as HTMLInputElement).value,
                      );
                    }
                    if (event.code === "Escape") {
                      controller.cancelRename();
                    }
                  }}
                  onblur={(event) =>
                    void controller.commitRename(
                      node.path,
                      (event.currentTarget as HTMLInputElement).value,
                    )}
                />
              </span>
            </div>
          {:else}
            <ContextMenu.Trigger>
              {#snippet child({ props })}
                <button
                  {...props}
                  type="button"
                  class={rowClass(node)}
                  data-path={node.path}
                  data-active={node.path === controller.selectedPath}
                  data-hint-target="folder-item"
                  data-hint-group="file-explorer"
                  aria-expanded={controller.isExpanded(node.path)}
                  onclick={() =>
                    controller.setExpanded(
                      node.path,
                      !controller.isExpanded(node.path),
                    )}
                  onkeydown={(event) => onRowKeydown(event, node)}
                  ondragenter={(event) => onDragEnter(event, node.path)}
                  ondragleave={onDragLeave}
                  ondragover={(event) => onDragOver(event, node.path)}
                  ondrop={(event) => void onDrop(event, node.path)}
                >
                  <WorkspaceIcon
                    name="chevron-right"
                    class="ui-workspace-explorer__chevron"
                  />
                  <WorkspaceIcon name={controller.iconFor(node, false)} />
                  <span class="ui-workspace-explorer__title">{node.name}</span>
                </button>
              {/snippet}
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
              <ContextMenu.Content
                class="ui-workspace-menu__content"
                data-ui-component="workspace-menu"
                data-ui-part="content"
              >
                <WorkspaceContextMenuItems {menu} />
              </ContextMenu.Content>
            </ContextMenu.Portal>
          {/if}
        </ContextMenu.Root>
        <Collapsible.Content>
          <ul class="ui-workspace-explorer__sublist">
            {#each node.children ?? [] as child (child.path)}
              {@render Tree({ node: child })}
            {/each}
          </ul>
        </Collapsible.Content>
      </Collapsible.Root>
    </li>
  {/if}
{/snippet}

<div
  class="ui-workspace-explorer"
  data-ui-component="workspace-explorer"
  data-ui-part="root"
  bind:this={rootEl}
>
  <div class="ui-workspace-explorer__toolbar" data-ui-part="toolbar">
    <div class="ui-workspace-explorer__toolbar-actions">
      <Button
        variant="ghost"
        size="sm"
        class="ui-workspace-explorer__toolbar-action"
        aria-label={labels.createFile}
        data-hint-target="file-explorer-action"
        data-hint-group="file-explorer"
        data-hint-target-id="file-explorer:create-file"
        onclick={() => void controller.createFile()}
      >
        <WorkspaceIcon name="square-pen" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="ui-workspace-explorer__toolbar-action"
        aria-label={labels.createFolder}
        data-hint-target="file-explorer-action"
        data-hint-group="file-explorer"
        data-hint-target-id="file-explorer:create-folder"
        onclick={() => void controller.createFolder()}
      >
        <WorkspaceIcon name="folder-plus" />
      </Button>
      <DropdownMenu.Root
        bind:open={sortMenuOpen}
        onOpenChange={(open) => {
          if (open) openSortMenu();
        }}
      >
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button
              variant="ghost"
              size="sm"
              class="ui-workspace-explorer__toolbar-action"
              aria-label={labels.sortFiles}
              data-tooltip={controller.sortMode === "name-asc"
                ? labels.filenameAsc
                : labels.filenameDesc}
              {...props}
            >
              <WorkspaceIcon name="arrow-up-a-z" />
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            class="ui-workspace-menu__content"
            data-ui-component="workspace-menu"
            data-ui-part="content"
            sideOffset={4}
          >
            {#if sortMenu}
              <WorkspaceMenuItems menu={sortMenu} />
            {/if}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <Button
        variant="ghost"
        size="sm"
        class="ui-workspace-explorer__toolbar-action"
        aria-label={labels.autoReveal}
        aria-pressed={controller.autoReveal}
        data-hint-target="file-explorer-action"
        data-hint-group="file-explorer"
        data-hint-target-id="file-explorer:auto-reveal"
        onclick={() => void controller.toggleAutoReveal()}
      >
        <WorkspaceIcon name="gallery-vertical" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="ui-workspace-explorer__toolbar-action"
        aria-label={labels.toggleCollapse}
        data-hint-target="file-explorer-action"
        data-hint-group="file-explorer"
        data-hint-target-id="file-explorer:toggle-collapse"
        onclick={() => controller.toggleCollapseAll()}
      >
        {#if controller.expandedPaths.size > 0}
          <WorkspaceIcon name="chevrons-down-up" />
        {:else}
          <WorkspaceIcon name="chevrons-up-down" />
        {/if}
      </Button>
    </div>
  </div>

  <ScrollArea class="ui-workspace-explorer__scroll">
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        {#snippet child({ props })}
          <div
            class="ui-workspace-explorer__body"
            {...props}
            data-drop={controller.dropTargetPath === "" ? "true" : undefined}
            onpointerdown={onBodyPointerDown}
            ondragenter={onBodyDragEnter}
            ondragleave={onBodyDragLeave}
            ondragover={onBodyDragOver}
            ondrop={(event) => void onDrop(event, "")}
          >
            <div
              class="ui-workspace-explorer__group-label"
              data-ui-part="group-label"
            >
              {labels.files}
            </div>
            <div class="ui-workspace-explorer__tree" data-ui-part="tree">
              {#if controller.loading}
                <div
                  class="ui-workspace-explorer__loading"
                  data-ui-part="loading"
                >
                  {labels.openingVault}
                </div>
              {:else}
                <ul class="ui-workspace-explorer__list">
                  {#each controller.root.children ?? [] as child (child.path)}
                    {@render Tree({ node: child })}
                  {/each}
                </ul>
              {/if}
            </div>
          </div>
        {/snippet}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          class="ui-workspace-menu__content"
          data-ui-component="workspace-menu"
          data-ui-part="content"
        >
          <WorkspaceContextMenuItems menu={rootMenu} />
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  </ScrollArea>
</div>
