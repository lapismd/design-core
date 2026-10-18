<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import { TableReader } from "@lapismd/mira/tables";
  import RichSourceReader from "./RichSourceReader.svelte";
  import ChatCommentArea from "./ChatCommentArea.svelte";
  import { richSourceContext, type RichSourceContext } from "./rich-source.js";
  import { tableSources } from "./table-source.js";
  import { validAnchor } from "./anchors.js";
  let {
    ref = $bindable(null),
    children,
    "data-transcript-from": from,
    "data-transcript-to": to,
  }: {
    ref?: HTMLElement | null;
    children?: Snippet;
    "data-transcript-from"?: number;
    "data-transcript-to"?: number;
    [key: string]: unknown;
  } = $props();
  const { block, comments } = getContext<RichSourceContext>(richSourceContext);
  const table = $derived(
    tableSources(block.text).find(
      (table) => table.from === from && table.to === to,
    ),
  );
  const annotations = $derived(
    comments.visibleThreads
      .filter(
        (thread) =>
          table &&
          validAnchor(block, thread.anchor) &&
          thread.anchor.from >= table.from &&
          thread.anchor.to <= table.to,
      )
      .map((thread) => ({
        thread,
        row: table!.rows.findIndex((row) => thread.anchor.to <= row.to),
      })),
  );
</script>

<div bind:this={ref} class="ui-transcript-rich-table">
  {#if table}
    <TableReader
      markdown={block.text.slice(table.from, table.to)}
      breakAfterRows={annotations.map((annotation) => annotation.row)}
    >
      {#snippet cell({ row, column, text })}
        {@const range = table.rows[row]?.cells[column]}
        {#if range}<RichSourceReader
            from={range.from}
            to={range.to}
            label="Table cell"
          />{:else}{text}{/if}
      {/snippet}
      {#snippet afterRow(row)}
        {#each annotations.filter((annotation) => annotation.row === row) as annotation (annotation.thread.id)}
          <div class="ui-transcript-comment-widget">
            <ChatCommentArea state={comments} threadId={annotation.thread.id} />
          </div>
        {/each}
      {/snippet}
    </TableReader>
  {:else}<table>{@render children?.()}</table>{/if}
</div>
