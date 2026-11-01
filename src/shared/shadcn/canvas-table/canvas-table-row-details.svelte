<script lang="ts">
  import { untrack } from "svelte";
  import { cellRect } from "./canvas-table-layout.js";
  import type { TableContext } from "./canvas-table-context.js";
  import type { BodyEntry } from "./canvas-table-types.js";
  let {
    ctx,
    entry,
    index,
    close,
  }: { ctx: TableContext; entry: BodyEntry; index: number; close: () => void } =
    $props();
  const rect = $derived(cellRect(ctx.layout(), index, 0));
  function measure(node: HTMLElement) {
    const id = entry.row.id;
    const read = () => {
      const height = Math.ceil(node.getBoundingClientRect().height);
      if (
        height > 0 &&
        untrack(() => ctx.state.detailHeights.get(id)) !== height
      )
        ctx.state.detailHeights.set(id, height);
    };
    const Observer = node.ownerDocument.defaultView?.ResizeObserver;
    const observer = Observer ? new Observer(read) : null;
    observer?.observe(node);
    read();
    return () => {
      observer?.disconnect();
      if (
        node.contains(node.ownerDocument.activeElement) &&
        ctx.state.scroller?.isConnected
      )
        ctx.state.scroller.focus();
    };
  }
</script>

<div
  class="canvas-table__row-detail-track"
  style:top="{rect.y + rect.height}px"
  style:width="{ctx.layout().width}px"
>
  <div
    role="gridcell"
    data-canvas-interactive
    data-canvas-detail={JSON.stringify(entry.row.id)}
    aria-colspan={ctx.layout().widths.length}
    class="canvas-table__row-detail-cell"
    style:left="{ctx.layout().gutter}px"
    style:width="{Math.max(1, ctx.state.width - ctx.layout().gutter)}px"
    style:clip-path={"inset(" +
      Math.max(0, ctx.state.top + ctx.layout().chrome - rect.y - rect.height) +
      "px 0 0 0)"}
  >
    <div class="canvas-table__row-detail" {@attach measure}>
      {#if ctx.props().rowDetails}{@render ctx.props().rowDetails!({
          row: entry.row,
          rowNumber: entry.number,
          close,
        })}{/if}
    </div>
  </div>
</div>
