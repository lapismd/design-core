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
    lineNumberForSplitSide,
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
    wrap = false,
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
    wrap?: boolean;
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

  $effect(() => {
    const container = rootEl;
    const shouldSync = viewMode === "split";
    const syncHorizontal = shouldSync && !wrap;
    if (!container || !shouldSync) return;
    const targets = [
      ...container.querySelectorAll<HTMLElement>(
        "[data-ui-part='file-diff-pane'] [data-ui-part='scroll-area-viewport']",
      ),
    ];
    if (targets.length === 0) return;
    let syncing = false;
    const listeners = targets.map((target) => {
      const onScroll = () => {
        if (syncing) return;
        syncing = true;
        for (const candidate of targets) {
          if (candidate === target) continue;
          if (candidate.scrollTop !== target.scrollTop) {
            candidate.scrollTop = target.scrollTop;
          }
          if (
            syncHorizontal &&
            candidate.scrollLeft !== target.scrollLeft
          ) {
            candidate.scrollLeft = target.scrollLeft;
          }
        }
        syncing = false;
      };
      target.addEventListener("scroll", onScroll, { passive: true });
      return () => target.removeEventListener("scroll", onScroll);
    });
    return () => {
      for (const stop of listeners) stop();
    };
  });

  $effect(() => {
    const container = rootEl;
    const shouldAlign = viewMode === "split" && wrap;
    if (!container) return;
    const pairKeys = [
      ...new Set(
        [
          ...container.querySelectorAll<HTMLElement>(
            "[data-ui-part='diff-row'][data-pair-key], .ui-diff-file-diff__row--empty[data-pair-key]",
          ),
        ].map((node) => node.dataset.pairKey ?? ""),
      ),
    ].filter(Boolean);
    for (const pairKey of pairKeys) {
      const nodes = [
        ...container.querySelectorAll<HTMLElement>(
          `[data-ui-part='diff-row'][data-pair-key="${pairKey}"], .ui-diff-file-diff__row--empty[data-pair-key="${pairKey}"]`,
        ),
      ];
      for (const node of nodes) node.style.minHeight = "";
      if (!shouldAlign) continue;
      const height = Math.max(
        ...nodes.map((node) => node.getBoundingClientRect().height),
        0,
      );
      for (const node of nodes) node.style.minHeight = `${height}px`;
    }
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

{#snippet splitCell(
    row: UnifiedDiffRow | null,
    side: "left" | "right",
    pairKey: string,
  )}
  {#if row}
    <div
      class="ui-diff-file-diff__row"
      data-ui-part="diff-row"
      data-diff-line-path={path}
      data-diff-line-number={row.lineNumber ?? ""}
      data-diff-line-variant={row.variant}
      data-variant={row.variant}
      data-side={side}
      data-pair-key={pairKey}
    >
      <span class="ui-diff-file-diff__gutter" aria-hidden="true">
        {lineNumberForSplitSide(row, side) ?? ""}
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
      data-pair-key={pairKey}
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
  data-wrap={wrap ? "true" : undefined}
  data-diff-file-path={path}
>
  {#if binary}
    <p class="ui-diff-file-diff__empty">Binary file not shown</p>
  {:else if empty}
    <p class="ui-diff-file-diff__empty">No textual changes</p>
  {:else if viewMode === "split"}
    <div class="ui-diff-file-diff__split">
      {#each ["left", "right"] as side (side)}
        {@const paneSide = side as "left" | "right"}
        <section
          class="ui-diff-file-diff__pane"
          data-ui-part="file-diff-pane"
          data-side={paneSide}
          aria-label={paneSide === "left"
            ? "Previous revision"
            : "Later revision"}
        >
          <ScrollArea.Root
            class="ui-diff-file-diff__pane-scroll"
            type="auto"
            orientation={wrap ? "vertical" : "both"}
          >
            <div class="ui-diff-file-diff__pane-stack">
              {#each splitPairs as pair (pair.key)}
                {@render splitCell(
                  paneSide === "left" ? pair.left : pair.right,
                  paneSide,
                  pair.key,
                )}
              {/each}
            </div>
          </ScrollArea.Root>
        </section>
      {/each}
    </div>
  {:else}
    <ScrollArea.Root
      class="ui-diff-file-diff__scroll"
      type="auto"
      orientation={wrap ? "vertical" : "both"}
    >
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
    </ScrollArea.Root>
  {/if}
</div>
