<script lang="ts">
  import type { Snippet } from "svelte";
  import { tick } from "svelte";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import { Button } from "../../shadcn/button/index.js";
  import { truncatePathMiddle } from "../core/unified-diff.js";
  import FileDiff from "./FileDiff.svelte";
  import type {
    FileDiffComposerFileContext,
    FileDiffFile,
    FileDiffFileScrollTarget,
    FileDiffLineContext,
    FileDiffScrollTarget,
    FileDiffViewMode,
  } from "./types.js";
  import "./FileDiff.css";

  let {
    files,
    viewMode = "unified",
    selectedPath,
    collapsedFilePaths = [],
    scrollToFile,
    stickyHeaders = false,
    scrollTo,
    onFileToggle,
    fileHeaderLeading,
    fileHeaderTrailing,
    lineAccessory,
    lineAnnotation,
  }: {
    files: FileDiffFile[];
    viewMode?: FileDiffViewMode;
    selectedPath?: string;
    collapsedFilePaths?: readonly string[];
    scrollToFile?: FileDiffFileScrollTarget | null;
    stickyHeaders?: boolean;
    scrollTo?: FileDiffScrollTarget | null;
    onFileToggle?: (path: string, collapsed: boolean) => void;
    fileHeaderLeading?: Snippet<[FileDiffComposerFileContext]>;
    fileHeaderTrailing?: Snippet<[FileDiffComposerFileContext]>;
    lineAccessory?: Snippet<[FileDiffLineContext]>;
    /** Host-owned content inserted after each matching unified diff row. */
    lineAnnotation?: Snippet<[FileDiffLineContext]>;
  } = $props();

  let rootEl: HTMLElement | null = $state(null);

  function fileContext(file: FileDiffFile): FileDiffComposerFileContext {
    return {
      file,
      path: file.path,
      collapsed: collapsedFilePaths.includes(file.path),
      selected: selectedPath === file.path,
    };
  }

  $effect(() => {
    const target = scrollToFile;
    if (!target || !rootEl) return;
    target.requestId;
    void tick().then(() => {
      const section = [
        ...(rootEl?.querySelectorAll<HTMLElement>("[data-diff-file-path]") ??
          []),
      ].find((candidate) => candidate.dataset.diffFilePath === target.path);
      section?.scrollIntoView({ block: "start", inline: "nearest" });
    });
  });
</script>

<div
  bind:this={rootEl}
  class="ui-diff-file-diff-composer"
  data-ui-component="file-diff-composer"
  data-ui-part="file-diff-composer"
  data-sticky-headers={stickyHeaders}
>
  {#if files.length === 0}
    <p class="ui-diff-file-diff__empty">No file diffs</p>
  {:else}
    {#each files as file (file.path)}
      {@const context = fileContext(file)}
      <section
        class="ui-diff-file-diff-composer__file"
        data-ui-part="file-section"
        data-diff-file-path={file.path}
        data-selected={context.selected}
        data-collapsed={context.collapsed}
      >
        <header class="ui-diff-file-diff-composer__header">
          <div class="ui-diff-file-diff-composer__header-start">
            {#if fileHeaderLeading}
              <div class="ui-diff-file-diff-composer__header-leading">
                {@render fileHeaderLeading(context)}
              </div>
            {/if}
            {#if onFileToggle}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`${context.collapsed ? "Expand" : "Collapse"} ${file.path}`}
                onclick={() => onFileToggle?.(file.path, !context.collapsed)}
              >
                {#if context.collapsed}
                  <ChevronRightIcon aria-hidden="true" />
                {:else}
                  <ChevronDownIcon aria-hidden="true" />
                {/if}
              </Button>
            {/if}
            <span title={file.path}>{truncatePathMiddle(file.path)}</span>
          </div>
          {#if fileHeaderTrailing}
            <div class="ui-diff-file-diff-composer__header-trailing">
              {@render fileHeaderTrailing(context)}
            </div>
          {/if}
        </header>
        {#if !context.collapsed}
          <FileDiff
            path={file.path}
            oldText={file.oldText}
            newText={file.newText}
            patch={file.patch}
            language={file.language}
            {viewMode}
            scrollTo={scrollTo?.path === file.path ||
            (scrollTo != null &&
              scrollTo.path == null &&
              files[0]?.path === file.path)
              ? scrollTo
              : null}
            {lineAccessory}
            {lineAnnotation}
          />
        {/if}
      </section>
    {/each}
  {/if}
</div>
