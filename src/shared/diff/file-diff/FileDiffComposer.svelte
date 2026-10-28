<script lang="ts">
  import type { Snippet } from "svelte";
  import { tick } from "svelte";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import { Button } from "../../shadcn/button/index.js";
  import { FileTypeIcon } from "../../shadcn/file-type-icon/index.js";
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
    wrap = false,
    sizing = "fill",
    fileContent,
    collapsedFilePaths = [],
    scrollToFile,
    stickyHeaders = false,
    scrollTo,
    onFileToggle,
    fileHeaderLeading,
    fileHeaderTrailing,
    fileHeaderMeta,
    expandOnHeaderClick = false,
    lineAccessory,
    lineAnnotation,
  }: {
    files: FileDiffFile[];
    viewMode?: FileDiffViewMode;
    selectedPath?: string;
    wrap?: boolean;
    sizing?: "fill" | "content";
    /** Host-owned file body; collapse, headers and navigation remain shared. */
    fileContent?: Snippet<[FileDiffComposerFileContext]>;
    collapsedFilePaths?: readonly string[];
    scrollToFile?: FileDiffFileScrollTarget | null;
    stickyHeaders?: boolean;
    scrollTo?: FileDiffScrollTarget | null;
    onFileToggle?: (path: string, collapsed: boolean) => void;
    fileHeaderLeading?: Snippet<[FileDiffComposerFileContext]>;
    fileHeaderTrailing?: Snippet<[FileDiffComposerFileContext]>;
    /** Noninteractive stats or status within the header's expansion target. */
    fileHeaderMeta?: Snippet<[FileDiffComposerFileContext]>;
    /** Expand the full header label and metadata area; actions remain independent. */
    expandOnHeaderClick?: boolean;
    lineAccessory?: Snippet<[FileDiffLineContext]>;
    /** Host-owned content inserted after each matching unified diff row. */
    lineAnnotation?: Snippet<[FileDiffLineContext]>;
  } = $props();

  const instanceId = $props.id();
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
    {#each files as file, index (file.path)}
      {@const context = fileContext(file)}
      <section
        class="ui-diff-file-diff-composer__file"
        data-ui-part="file-section"
        data-diff-file-path={file.path}
        data-selected={context.selected}
        data-collapsed={context.collapsed}
      >
        <header
          class="ui-diff-file-diff-composer__header"
          data-expand-on-click={expandOnHeaderClick && !!onFileToggle}
        >
          {#if expandOnHeaderClick && onFileToggle}
            <button
              type="button"
              class="ui-diff-file-diff-composer__header-toggle"
              aria-expanded={!context.collapsed}
              aria-controls={`${instanceId}-file-${index}`}
              onclick={() => onFileToggle?.(file.path, !context.collapsed)}
            >
              <span class="ui-diff-file-diff-composer__action"
                >{context.collapsed ? "Expand" : "Collapse"}</span
              >
              {#if context.collapsed}<ChevronRightIcon
                  aria-hidden="true"
                />{:else}<ChevronDownIcon aria-hidden="true" />{/if}
              {#if fileHeaderLeading}{@render fileHeaderLeading(context)}
              {:else}<FileTypeIcon path={file.path} size="s" />{/if}
              <span class="ui-diff-file-diff-composer__path" title={file.path}
                >{truncatePathMiddle(file.path)}</span
              >
              {#if fileHeaderMeta}<span class="ui-diff-file-diff-composer__meta"
                  >{@render fileHeaderMeta(context)}</span
                >{/if}
            </button>
          {:else}
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
                  aria-expanded={!context.collapsed}
                  aria-controls={`${instanceId}-file-${index}`}
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
              {#if file.path && !fileHeaderLeading}<FileTypeIcon
                  path={file.path}
                  size="s"
                />{/if}
              <span title={file.path}>{truncatePathMiddle(file.path)}</span>
            </div>
            {#if fileHeaderMeta}<div class="ui-diff-file-diff-composer__meta">
                {@render fileHeaderMeta(context)}
              </div>{/if}
          {/if}
          {#if fileHeaderTrailing}
            <div class="ui-diff-file-diff-composer__header-trailing">
              {@render fileHeaderTrailing(context)}
            </div>
          {/if}
        </header>
        <div
          class="ui-diff-file-diff-composer__content"
          id={`${instanceId}-file-${index}`}
          hidden={context.collapsed}
        >
          {#if !context.collapsed}
            {#if fileContent}
              {@render fileContent(context)}
            {:else}
              <FileDiff
                path={file.path}
                {...file.oldText === undefined ? {} : { oldText: file.oldText }}
                {...file.newText === undefined ? {} : { newText: file.newText }}
                {...file.patch === undefined ? {} : { patch: file.patch }}
                {...file.language === undefined
                  ? {}
                  : { language: file.language }}
                {viewMode}
                {wrap}
                {sizing}
                scrollTo={scrollTo?.path === file.path ||
                (scrollTo != null &&
                  scrollTo.path == null &&
                  files[0]?.path === file.path)
                  ? scrollTo
                  : null}
                {...lineAccessory === undefined ? {} : { lineAccessory }}
                {...lineAnnotation === undefined ? {} : { lineAnnotation }}
              />
            {/if}
          {/if}
        </div>
      </section>
    {/each}
  {/if}
</div>
