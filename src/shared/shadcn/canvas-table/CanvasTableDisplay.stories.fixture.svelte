<script lang="ts">
  import { CanvasTable, type CanvasTableCellContext } from "./index.js";
  import { Toggle } from "../toggle/index.js";
  import WrapText from "@lucide/svelte/icons/wrap-text";
  import Palette from "@lucide/svelte/icons/palette";
  let wrapText = $state(false);
  let columnColours = $state(false);
  const rows = [
    {
      id: "alpha",
      cells: [
        "Research findings are ready for a detailed review with the team before the next planning session.",
      ],
    },
  ];
</script>

{#snippet cell(context: CanvasTableCellContext)}<span>{context.value}</span
  >{/snippet}
<div class="display-controls">
  <Toggle bind:pressed={wrapText} aria-label="Wrap text"><WrapText /></Toggle>
  <Toggle bind:pressed={columnColours} aria-label="Column colours"
    ><Palette /></Toggle
  >
</div>
<div class="display-table">
  <CanvasTable
    {rows}
    columnWidths={[180]}
    headerRow={false}
    toolbar={false}
    contextMenu={false}
    columns={[{ id: "summary", label: "Summary", cell }]}
    {wrapText}
    {columnColours}
  />
</div>

<style>
  .display-controls {
    display: flex;
    gap: 0.25rem;
  }
  .display-table {
    height: 260px;
  }
</style>
