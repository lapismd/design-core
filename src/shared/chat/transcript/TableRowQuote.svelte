<script lang="ts">
  import { TableReader } from "@lapismd/mira/tables";
  import type { TranscriptCommentAnchor } from "./model.js";
  import { tableSources } from "./table-source.js";
  import QuotedTableCell from "./QuotedTableCell.svelte";
  let {
    context,
  }: { context: NonNullable<TranscriptCommentAnchor["tableContext"]> } =
    $props();
  const table = $derived(tableSources(context.markdown)[0]);
</script>

<TableReader
  markdown={context.markdown}
  showHeader={context.from <= (table?.rows[0]?.to ?? 0)}
  label="Commented table row"
>
  {#snippet cell({ row, column, text })}
    {@const range = table?.rows[row]?.cells[column]}
    {#if range}
      <QuotedTableCell
        text={context.markdown.slice(range.from, range.to)}
        from={Math.max(
          0,
          Math.min(range.to - range.from, context.from - range.from),
        )}
        to={Math.max(
          0,
          Math.min(range.to - range.from, context.to - range.from),
        )}
      />
    {:else}{text}{/if}
  {/snippet}
</TableReader>
