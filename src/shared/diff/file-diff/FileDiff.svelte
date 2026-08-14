<script lang="ts">
  import type { Snippet } from "svelte";
  import { onMount } from "svelte";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronUpIcon from "@lucide/svelte/icons/chevron-up";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import { Button } from "../../shadcn/button/index.js";
  import * as ScrollArea from "../../shadcn/scroll-area/index.js";
  import { ensureHighlightStyles } from "../../shadcn/code-block/index.js";
  import {
    INCREMENTAL_EXPAND_STEP,
    INCREMENTAL_EXPAND_THRESHOLD,
    buildDisplayItems,
    buildUnifiedDiffRows,
    isBinaryFilePath,
    pairRowsForSplit,
    parsePatchToRows,
    type CollapsedContextBlock,
    type ExpandedBlockState,
    type UnifiedDiffRow,
  } from "../core/unified-diff.js";
  import { expandAll, expandBottom, expandTop } from "./expand.js";
  import { highlightText } from "./highlight.js";
  import { resolveDiffLanguage } from "./language.js";
  import type {
    FileDiffLineContext,
    FileDiffScrollTarget,
    FileDiffViewMode,
  } from "./types.js";
  import "./FileDiff.css";

  let {
    path,
    oldText = null,
    newText = null,
    patch,
    viewMode = "unified",
    language,
    scrollTo,
    lineAccessory,
  }: {
    path: string;
    oldText?: string | null;
    newText?: string | null;
    /** Unified patch used when old/new texts are omitted. */
    patch?: string;
    viewMode?: FileDiffViewMode;
    language?: string;
    scrollTo?: FileDiffScrollTarget | null;
    lineAccessory?: Snippet<[FileDiffLineContext]>;
  } = $props();

  let expandedBlocks = $state<ExpandedBlockState>({});
  let rootEl: HTMLElement | null = $state(null);

  const resolvedLanguage = $derived(resolveDiffLanguage(path, language));
  const binary = $derived(isBinaryFilePath(path));
  const rows = $derived.by((): UnifiedDiffRow[] => {
    if (binary) return [];
    if (patch != null && oldText == null && newText == null) {
      return parsePatchToRows(patch);
    }
    return buildUnifiedDiffRows(oldText, newText ?? "");
  });
  const displayItems = $derived(buildDisplayItems(rows, expandedBlocks));
  const splitPairs = $derived(pairRowsForSplit(rows));
  const empty = $derived(!binary && rows.length === 0);

  onMount(() => {
    ensureHighlightStyles();
  });

  $effect(() => {
    const target = scrollTo;
    if (!target || !rootEl) return;
    if (target.path && target.path !== path) return;
    const variant = target.variant
      ? `[data-diff-line-variant="${target.variant}"]`
      : "";
    const node = rootEl.querySelector<HTMLElement>(
      `[data-diff-line-number="${target.lineNumber}"]${variant}`,
    );
    node?.scrollIntoView({ block: "center", inline: "nearest" });
  });

  function lineContext(row: UnifiedDiffRow): FileDiffLineContext {
    return {
      path,
      lineNumber: row.lineNumber,
      variant: row.variant,
      text: row.text,
    };
  }
</script>

{#snippet highlightedText(row: UnifiedDiffRow)}
  {#if row.segments}
    <span class="ui-diff-file-diff__text">
      {#each row.segments as segment (segment.key)}
        <span data-tone={segment.tone === "context" ? undefined : segment.tone}>
          {#each highlightText(segment.text, resolvedLanguage) as part (part.key)}
            {#if part.type}
              <span class={`ui-code-token-${part.type}`}>{part.text}</span>
            {:else}
              {part.text}
            {/if}
          {/each}
        </span>
      {/each}
    </span>
  {:else}
    <span class="ui-diff-file-diff__text">
      {#each highlightText(row.text, resolvedLanguage) as part (part.key)}
        {#if part.type}
          <span class={`ui-code-token-${part.type}`}>{part.text}</span>
        {:else}
          {part.text}
        {/if}
      {/each}
    </span>
  {/if}
{/snippet}

{#snippet unifiedRow(row: UnifiedDiffRow)}
  <div
    class="ui-diff-file-diff__row"
    data-ui-part="diff-row"
    data-diff-line-path={path}
    data-diff-line-number={row.lineNumber ?? ""}
    data-diff-line-variant={row.variant}
    data-variant={row.variant}
  >
    <span class="ui-diff-file-diff__gutter" aria-hidden="true">
      {row.lineNumber ?? ""}
    </span>
    <span class="ui-diff-file-diff__marker" aria-hidden="true">
      {row.variant === "added" ? "+" : row.variant === "removed" ? "-" : " "}
    </span>
    {@render highlightedText(row)}
    {#if lineAccessory}
      {@render lineAccessory(lineContext(row))}
    {/if}
  </div>
{/snippet}

{#snippet splitCell(row: UnifiedDiffRow | null, side: "left" | "right")}
  {#if row}
    <div
      class="ui-diff-file-diff__row"
      data-ui-part="diff-row"
      data-diff-line-path={path}
      data-diff-line-number={row.lineNumber ?? ""}
      data-diff-line-variant={row.variant}
      data-variant={row.variant}
      data-side={side}
    >
      <span class="ui-diff-file-diff__gutter" aria-hidden="true">
        {row.lineNumber ?? ""}
      </span>
      {@render highlightedText(row)}
      {#if lineAccessory}
        {@render lineAccessory(lineContext(row))}
      {/if}
    </div>
  {:else}
    <div
      class="ui-diff-file-diff__row ui-diff-file-diff__row--empty"
      data-side={side}
    ></div>
  {/if}
{/snippet}

{#snippet collapsedControls(block: CollapsedContextBlock)}
  {#if block.expanded}
    <Button
      variant="ghost"
      size="sm"
      onclick={() => {
        expandedBlocks = expandAll(expandedBlocks, block.id);
      }}
    >
      <ChevronDownIcon />
      Hide {block.count} unmodified lines
    </Button>
  {:else if block.count < INCREMENTAL_EXPAND_THRESHOLD}
    <Button
      variant="ghost"
      size="sm"
      onclick={() => {
        expandedBlocks = expandAll(expandedBlocks, block.id);
      }}
    >
      <ChevronsUpDownIcon />
      Show {block.count} unmodified lines
    </Button>
  {:else}
    <div class="ui-diff-file-diff__collapse-actions">
      <Button
        variant="ghost"
        size="sm"
        onclick={() => {
          expandedBlocks = expandTop(
            expandedBlocks,
            block.id,
            INCREMENTAL_EXPAND_STEP,
          );
        }}
      >
        <ChevronDownIcon />
        ↓ {INCREMENTAL_EXPAND_STEP} lines
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onclick={() => {
          expandedBlocks = expandAll(expandedBlocks, block.id);
        }}
      >
        <ChevronsUpDownIcon />
        Show all {block.count} lines
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onclick={() => {
          expandedBlocks = expandBottom(
            expandedBlocks,
            block.id,
            INCREMENTAL_EXPAND_STEP,
          );
        }}
      >
        <ChevronUpIcon />
        ↑ {INCREMENTAL_EXPAND_STEP} lines
      </Button>
    </div>
  {/if}
{/snippet}

<div
  bind:this={rootEl}
  class="ui-diff-file-diff"
  data-ui-component="file-diff"
  data-ui-part="file-diff"
  data-view-mode={viewMode}
  data-diff-file-path={path}
>
  {#if binary}
    <p class="ui-diff-file-diff__empty">Binary file not shown</p>
  {:else if empty}
    <p class="ui-diff-file-diff__empty">No textual changes</p>
  {:else}
    <ScrollArea.Root orientation="both">
      {#if viewMode === "split"}
        <div class="ui-diff-file-diff__split">
          {#each splitPairs as pair (pair.key)}
            <div class="ui-diff-file-diff__split-pair">
              {@render splitCell(pair.left, "left")}
              {@render splitCell(pair.right, "right")}
            </div>
          {/each}
        </div>
      {:else}
        {#each displayItems as item (item.type === "row" ? item.row.key : item.block.id)}
          {#if item.type === "row"}
            {@render unifiedRow(item.row)}
          {:else}
            <div data-ui-part="collapsed-context">
              {@render collapsedControls(item.block)}
              {#if item.block.expanded}
                {#each item.block.rows as row (row.key)}
                  {@render unifiedRow(row)}
                {/each}
              {/if}
            </div>
          {/if}
        {/each}
      {/if}
    </ScrollArea.Root>
  {/if}
</div>
