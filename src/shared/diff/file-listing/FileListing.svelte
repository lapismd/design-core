<script lang="ts">
  import type { Snippet } from "svelte";
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
    buildFileTree,
    buildPackageFileTree,
    getFileDirectory,
    getFilePathName,
    type FileTreeNode,
  } from "../core/file-tree.js";
  import FileChangeStats from "../file-change-stats/FileChangeStats.svelte";
  import { fileIconNameForPath } from "./file-icon.js";
  import type {
    FileListingDirectoryContext,
    FileListingFile,
    FileListingFileContext,
    FileListingViewMode,
  } from "./types.js";
  import "./FileListing.css";

  let {
    files,
    mode = "tree",
    selectedPath = $bindable(null),
    collapsedDirectoryPaths,
    onSelectPath,
    onDirectoryToggle,
    fileLeading,
    fileLabel,
    fileMeta,
    directoryMeta,
  }: {
    /** Host-owned change-set rows. Paths are the only required field. */
    files: FileListingFile[];
    /** `list` shows paths; `tree` and `package` group by folders. */
    mode?: FileListingViewMode;
    selectedPath?: string | null;
    /** When set, directory disclosure is host-controlled. */
    collapsedDirectoryPaths?: ReadonlySet<string>;
    onSelectPath?: (path: string) => void;
    onDirectoryToggle?: (path: string) => void;
    fileLeading?: Snippet<[FileListingFileContext<FileListingFile>]>;
    fileLabel?: Snippet<[FileListingFileContext<FileListingFile>]>;
    fileMeta?: Snippet<[FileListingFileContext<FileListingFile>]>;
    directoryMeta?: Snippet<[FileListingDirectoryContext]>;
  } = $props();

  let internalCollapsed = new SvelteSet<string>();

  const resolvedCollapsed = $derived(
    collapsedDirectoryPaths ?? internalCollapsed,
  );
  const filesByPath = $derived(new Map(files.map((file) => [file.path, file])));
  const tree = $derived(
    mode === "package"
      ? buildPackageFileTree(files.map((file) => file.path))
      : buildFileTree(files.map((file) => file.path)),
  );
  const sortedFiles = $derived(
    [...files].sort((left, right) => left.path.localeCompare(right.path)),
  );

  function isCollapsed(path: string): boolean {
    return resolvedCollapsed.has(path);
  }

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
      node,
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
    aria-label={path}
    aria-current={context.isSelected ? "true" : undefined}
    style={depth === undefined ? undefined : `--ui-diff-file-depth: ${depth}`}
    onclick={() => selectPath(path)}
  >
    {#if depth !== undefined}
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

{#snippet treeNode(node: FileTreeNode, depth: number)}
  {#if node.type === "file"}
    {@const file = filesByPath.get(node.path)}
    {#if file}
      {@render fileRow(file, node.path, node, depth)}
    {/if}
  {:else}
    {@const collapsed = isCollapsed(node.path)}
    {@const directoryContext = { node, depth, isCollapsed: collapsed }}
    <div data-ui-part="directory">
      <button
        type="button"
        class="ui-diff-file-listing__row ui-diff-file-listing__row--directory"
        data-ui-part="directory-row"
        data-directory-path={node.path}
        aria-label={node.path}
        aria-expanded={!collapsed}
        style={`--ui-diff-file-depth: ${depth}`}
        onclick={() => toggleDirectory(node.path)}
      >
        <span class="ui-diff-file-listing__chevron" aria-hidden="true">
          {#if collapsed}
            <ChevronRightIcon size={14} />
          {:else}
            <ChevronDownIcon size={14} />
          {/if}
        </span>
        <span class="ui-diff-file-listing__icon" aria-hidden="true">
          {#if collapsed}
            <FolderIcon size={14} />
          {:else}
            <FolderOpenIcon size={14} />
          {/if}
        </span>
        <span class="ui-diff-file-listing__label">{node.name}</span>
        {#if directoryMeta}
          {@render directoryMeta(directoryContext)}
        {/if}
      </button>
      {#if node.children.length > 0 && !collapsed}
        {#each node.children as child (child.path)}
          {@render treeNode(child, depth + 1)}
        {/each}
      {/if}
    </div>
  {/if}
{/snippet}

<div
  class="ui-diff-file-listing"
  data-ui-component="file-listing"
  data-ui-part="file-listing"
  data-mode={mode}
>
  {#if files.length === 0}
    <p class="ui-diff-file-listing__empty">No changed files</p>
  {:else if mode === "list"}
    {#each sortedFiles as file (file.path)}
      {@render fileRow(file, file.path, undefined, undefined)}
    {/each}
  {:else}
    {#each tree as node (node.path)}
      {@render treeNode(node, 0)}
    {/each}
  {/if}
</div>
