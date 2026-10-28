export const FitContents = `<script lang="ts">
  import { onDestroy } from "svelte";
  import * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";
  const controller = ColumnCanvas.createColumnCanvasController({
    columns: { files: { defaultWidth: 320, minWidth: 240, maxWidth: 960, resizable: true } }
  });
  onDestroy(() => void controller.dispose());
</script>

<div style="height:24rem">
  <ColumnCanvas.Root {controller} displayMode="fixed">
    <!-- Double-click the rail (or press Enter) to expand/reset. -->
    <ColumnCanvas.Column id="files" title="Files" fitMaxWidth={720}>
      <ColumnCanvas.Body orientation="both">
        <pre>Recorded content with a longer line to inspect.</pre>
      </ColumnCanvas.Body>
    </ColumnCanvas.Column>
  </ColumnCanvas.Root>
</div>`;
