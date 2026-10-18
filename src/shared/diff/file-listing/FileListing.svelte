<script lang="ts">
  import { tick, type Snippet } from "svelte";
  import { SvelteSet } from "svelte/reactivity";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import FileIcon from "@lucide/svelte/icons/file";
  import FileCodeIcon from "@lucide/svelte/icons/file-code";
  import FileCode2Icon from "@lucide/svelte/icons/file-code-2";
  import FileJsonIcon from "@lucide/svelte/icons/file-json";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import FolderIcon from "@lucide/svelte/icons/folder";
  import FolderOpenIcon from "@lucide/svelte/icons/folder-open";
  import ImageIcon from "@lucide/svelte/icons/image";
  import {
    getFileDirectory,
    getFilePathName,
    type FileTreeNode,
  } from "../core/file-tree.js";
  import { formatDiffDelta } from "../file-change-stats/format-diff-delta.js";
  import FileChangeStats from "../file-change-stats/FileChangeStats.svelte";
  import { fileIconNameForPath } from "./file-icon.js";
  import { fileListingRows, type FileListingRow } from "./file-listing-rows.js";
  import FileListingVirtualRows from "./FileListingVirtualRows.svelte";
  import type {
    FileListingDirectory,
    FileListingDirectoryContext,
    FileListingFile,
    FileListingFileContext,
    FileListingViewMode,
  } from "./types.js";
  import "./FileListing.css";

  let {
    files,
    directories = [],
    mode = "tree",
    selectedPath = $bindable(null),
    collapsedDirectoryPaths,
    onSelectPath,
    onDirectoryToggle,
    onFileDragStart,
    fileDraggable,
    onDirectoryDragStart,
    directoryDraggable,
    fileLeading,
    fileLabel,
    fileMeta,
    directoryMeta,
    virtualize = false,
    virtualEstimateSize = 32,
    virtualOverscan = 8,
    hasMore = false,
    loading = false,
    loadingLabel = "Loading more files",
    onLoadMore,
  }: {
    /** Host-owned change-set rows. Paths are the only required field. */
    files: FileListingFile[];
    /** Host-owned directories that may not have loaded children yet. */
    directories?: FileListingDirectory[];
    /** `list` shows paths; `tree` and `package` group by folders. */
    mode?: FileListingViewMode;
    selectedPath?: string | null;
    /** When set, directory disclosure is host-controlled. */
    collapsedDirectoryPaths?: ReadonlySet<string>;
    onSelectPath?: (path: string) => void;
    onDirectoryToggle?: (path: string) => void;
    /** Host-owned payload and drag eligibility; rows are inert by default. */
    onFileDragStart?: (
      event: DragEvent,
      context: FileListingFileContext<FileListingFile>,
    ) => void;
    fileDraggable?: (
      context: FileListingFileContext<FileListingFile>,
    ) => boolean;
    onDirectoryDragStart?: (
      event: DragEvent,
      context: FileListingDirectoryContext,
    ) => void;
    directoryDraggable?: (context: FileListingDirectoryContext) => boolean;
    fileLeading?: Snippet<[FileListingFileContext<FileListingFile>]>;
    fileLabel?: Snippet<[FileListingFileContext<FileListingFile>]>;
    fileMeta?: Snippet<[FileListingFileContext<FileListingFile>]>;
    directoryMeta?: Snippet<[FileListingDirectoryContext]>;
    /** Mount only measured rows nearest the owning scroll viewport. */
    virtualize?: boolean;
    /** Estimated row height in CSS pixels before measurement. */
    virtualEstimateSize?: number;
    /** Extra rows retained above and below the visible range. */
    virtualOverscan?: number;
    /** Whether the host can supply another cursor page. */
    hasMore?: boolean;
    /** Prevents duplicate edge requests while the host loads a page. */
    loading?: boolean;
    loadingLabel?: string;
    /** Requests the next host-owned page near the loaded edge. */
    onLoadMore?: () => void;
  } = $props();

  let internalCollapsed = new SvelteSet<string>();
  let virtualRows = $state<{ scrollToIndex(index: number): void }>();
  let root: HTMLDivElement;

  const resolvedCollapsed = $derived(
    collapsedDirectoryPaths ?? internalCollapsed,
  );
  const rows = $derived(
    fileListingRows(files, mode, resolvedCollapsed, directories),
  );

  function toggleDirectory(path: string) {
    if (onDirectoryToggle) {
      onDirectoryToggle(path);
      return;
    }
    if (internalCollapsed.has(path)) internalCollapsed.delete(path);
    else internalCollapsed.add(path);
  }

  function selectPath(path: string) {
    selectedPath = path;
    onSelectPath?.(path);
  }

  async function focusVirtualRow(index: number): Promise<void> {
    virtualRows?.scrollToIndex(index);
    await tick();
    requestAnimationFrame(() => {
      root
        .querySelector<HTMLElement>(`[data-row-index="${index}"] button`)
        ?.focus();
    });
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (
      !virtualize ||
      !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
    )
      return;
    const current = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-row-index]",
    );
    const currentIndex = current
      ? Number(current.dataset.rowIndex)
      : Math.max(
          0,
          rows.findIndex(
            (row) => row.kind === "file" && row.path === selectedPath,
          ),
        );
    const index =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? rows.length - 1
          : event.key === "ArrowUp"
            ? Math.max(0, currentIndex - 1)
            : Math.min(
                rows.length - 1,
                current ? currentIndex + 1 : currentIndex,
              );
    if (index < 0) return;
    event.preventDefault();
    void focusVirtualRow(index);
  }

  function fileContext(
    file: FileListingFile,
    path: string,
    node?: FileTreeNode,
  ): FileListingFileContext<FileListingFile> {
    return {
      file,
      path,
      name: node?.name ?? getFilePathName(path),
      directory: getFileDirectory(path),
      isSelected: path === selectedPath,
      mode,
      ...(node === undefined ? {} : { node }),
    };
  }
</script>

{#snippet fileIcon(path: string)}
  {@const icon = fileIconNameForPath(path)}
  {#if icon === "file-code-2"}
    <FileCode2Icon size={14} aria-hidden="true" />
  {:else if icon === "file-json"}
    <FileJsonIcon size={14} aria-hidden="true" />
  {:else if icon === "file-text"}
    <FileTextIcon size={14} aria-hidden="true" />
  {:else if icon === "file-code"}
    <FileCodeIcon size={14} aria-hidden="true" />
  {:else if icon === "image"}
    <ImageIcon size={14} aria-hidden="true" />
  {:else}
    <FileIcon size={14} aria-hidden="true" />
  {/if}
{/snippet}

{#snippet fileRow(
  file: FileListingFile,
  path: string,
  node: FileTreeNode | undefined,
  depth: number | undefined,
)}
  {@const context = fileContext(file, path, node)}
  <button
    type="button"
    class="ui-diff-file-listing__row"
    class:ui-diff-file-listing__row--selected={context.isSelected}
    data-ui-part="file-row"
    data-file-path={path}
    aria-label={fileLeading || fileLabel || fileMeta
      ? undefined
      : [
          path,
          ...(file.additions && file.additions > 0
            ? [formatDiffDelta(file.additions, "+")]
            : []),
          ...(file.deletions && file.deletions > 0
            ? [formatDiffDelta(file.deletions, "-")]
            : []),
        ].join(" ")}
    aria-current={context.isSelected ? "true" : undefined}
    style={depth === undefined ? undefined : `--ui-diff-file-depth: ${depth}`}
    onclick={() => selectPath(path)}
    onkeydown={handleKeydown}
    draggable={Boolean(onFileDragStart) && (fileDraggable?.(context) ?? true)}
    ondragstart={(event) => onFileDragStart?.(event, context)}
  >
    {#if depth !== undefined && depth > 0}
      <span class="ui-diff-file-listing__chevron" aria-hidden="true"></span>
    {/if}
    <span class="ui-diff-file-listing__icon">
      {@render fileIcon(path)}
    </span>
    {#if fileLeading}
      {@render fileLeading(context)}
    {/if}
    {#if fileLabel}
      {@render fileLabel(context)}
    {:else}
      <span class="ui-diff-file-listing__label">
        {mode === "list" ? path : context.name}
      </span>
    {/if}
    {#if fileMeta}
      {@render fileMeta(context)}
    {:else}
      <FileChangeStats
        additions={file.additions ?? 0}
        deletions={file.deletions ?? 0}
      />
    {/if}
  </button>
{/snippet}

{#snippet listingRow(row: FileListingRow<FileListingFile>, _index: number)}
  {#if row.kind === "file"}
    {@render fileRow(row.file, row.path, row.node, row.depth)}
  {:else}
    {@const directoryContext = {
      node: row.node,
      depth: row.depth,
      isCollapsed: row.collapsed,
    }}
    <button
      type="button"
      class="ui-diff-file-listing__row ui-diff-file-listing__row--directory"
      data-ui-part="directory-row"
      data-directory-path={row.path}
      draggable={Boolean(onDirectoryDragStart) &&
        (directoryDraggable?.(directoryContext) ?? true)}
      ondragstart={(event) => onDirectoryDragStart?.(event, directoryContext)}
      aria-label={row.path}
      aria-expanded={!row.collapsed}
      style={`--ui-diff-file-depth: ${row.depth}`}
      onclick={() => toggleDirectory(row.path)}
      onkeydown={handleKeydown}
    >
      <span class="ui-diff-file-listing__chevron" aria-hidden="true">
        {#if row.collapsed}<ChevronRightIcon size={14} />{:else}<ChevronDownIcon
            size={14}
          />{/if}
      </span>
      <span class="ui-diff-file-listing__icon" aria-hidden="true">
        {#if row.collapsed}<FolderIcon size={14} />{:else}<FolderOpenIcon
            size={14}
          />{/if}
      </span>
      <span class="ui-diff-file-listing__label">{row.node.name}</span>
      {#if directoryMeta}{@render directoryMeta(directoryContext)}{/if}
    </button>
  {/if}
{/snippet}

<div
  bind:this={root}
  class="ui-diff-file-listing"
  data-ui-component="file-listing"
  data-ui-part="file-listing"
  data-mode={mode}
  data-virtualized={virtualize ? "true" : undefined}
>
  {#if files.length === 0 && directories.length === 0}
    <p class="ui-diff-file-listing__empty">No changed files</p>
  {:else if virtualize}
    <FileListingVirtualRows
      bind:this={virtualRows}
      {rows}
      row={listingRow}
      estimateSize={virtualEstimateSize}
      overscan={virtualOverscan}
      {hasMore}
      {loading}
      {loadingLabel}
      {...onLoadMore === undefined ? {} : { onLoadMore }}
    />
  {:else}
    {#each rows as row, index (row.key)}
      {@render listingRow(row, index)}
    {/each}
  {/if}
</div>
