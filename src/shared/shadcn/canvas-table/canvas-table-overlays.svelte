<script lang="ts">
  import ArrowUpDown from "@lucide/svelte/icons/arrow-up-down";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronUp from "@lucide/svelte/icons/chevron-up";
  import { Button } from "../button/index.js";
  import { createPointer } from "./canvas-table-pointer.js";
  import { cellRect, visibleColumns } from "./canvas-table-layout.js";
  import {
    columnLetter,
    SORT_HIT,
    LETTER_HEIGHT,
  } from "./canvas-table-text.js";
  import type { TableContext } from "./canvas-table-context.js";
  import type { TableNavigation } from "./canvas-table-navigation.js";
  import type { createKeyboard } from "./canvas-table-keyboard.js";

  let {
    ctx,
    nav,
    keyboard,
  }: {
    ctx: TableContext;
    nav: TableNavigation;
    keyboard: ReturnType<typeof createKeyboard>;
  } = $props();
  const layout = $derived(ctx.layout());
  const config = $derived(ctx.props());
  const columns = $derived.by(() => {
    const range = visibleColumns(layout, ctx.state.left, ctx.state.width);
    return Array.from(
      { length: range.end - range.start },
      (_, i) => range.start + i,
    );
  });
  const editorRect = $derived.by(() => {
    const cell = ctx.state.active;
    if (!cell) return null;
    const index = nav.index(cell);
    if (index < -1) return null;
    const rect = cellRect(layout, index, cell.col);
    return {
      ...rect,
      header: index < 0,
      x: rect.x - ctx.state.left,
      y: rect.y - (index < 0 ? 0 : ctx.state.top),
    };
  });
  function focusEditor(node: HTMLInputElement) {
    node.focus();
    if (ctx.state.selectOnEdit) node.select();
  }
</script>

<div
  class="canvas-table__overlays"
  style:width="{ctx.state.width}px"
  style:height="{ctx.state.height}px"
  style:clip-path={"inset(0 0 0 " + layout.gutter + "px)"}
>
  {#if config.onSort}
    {#each columns as col (col)}
      <div
        class="canvas-table__sort-anchor"
        style={"left:" +
          ((layout.edges[col + 1] ?? 0) - ctx.state.left - SORT_HIT) +
          "px;top:1px;width:" +
          (SORT_HIT - 6) +
          "px;height:" +
          (LETTER_HEIGHT - 2) +
          "px"}
      >
        <Button
          class="canvas-table__sort"
          variant="ghost"
          size="icon"
          aria-label={"Sort " +
            ((layout.headerRow ? config.rows[0]?.cells[col] : null) ||
              columnLetter(col))}
          aria-pressed={config.sort?.column === col}
          oncontextmenu={createPointer(ctx, nav).contextMenu}
          onclick={() => {
            nav.commitEdit();
            ctx.state.range = null;
            ctx.state.target = "cell";
            config.onSort?.(col);
          }}
        >
          {#if config.sort?.column === col}
            {#if config.sort.direction === "asc"}<ChevronUp
              />{:else}<ChevronDown />{/if}
          {:else}<ArrowUpDown />{/if}
        </Button>
      </div>
    {/each}
  {/if}
  {#if ctx.state.editing && editorRect}
    <div
      class="canvas-table__editor-layer"
      style:clip-path={"inset(" +
        (editorRect.header ? LETTER_HEIGHT : layout.chrome) +
        "px 0 0 0)"}
    >
      <input
        class="canvas-table__editor"
        aria-label="Edit cell"
        style:left="{editorRect.x}px"
        style:top="{editorRect.y}px"
        style:width="{editorRect.width}px"
        style:height="{editorRect.height}px"
        bind:value={ctx.state.draft}
        {@attach focusEditor}
        onkeydown={keyboard.editor}
        onblur={nav.commitEdit}
      />
    </div>
  {/if}
</div>
