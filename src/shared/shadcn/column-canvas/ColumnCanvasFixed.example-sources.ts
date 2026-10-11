export const FixedColumns = `<script lang="ts">
  import * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";
  const canvas = ColumnCanvas.createColumnCanvasController({
    columns: {
      unstaged: { defaultWidth: 320, minWidth: 240, collapsible: true, resizable: true },
      stack: { defaultWidth: 390, minWidth: 280, resizable: true },
      diff: { defaultWidth: 600, minWidth: 320, resizable: true },
    },
  });
</script>

<div style="height: 480px">
  <ColumnCanvas.Root controller={canvas} displayMode="fixed">
    <ColumnCanvas.Column id="unstaged" title="Unstaged" fixed>
      <ColumnCanvas.Body><ColumnCanvas.Item>README.md</ColumnCanvas.Item></ColumnCanvas.Body>
    </ColumnCanvas.Column>
    <ColumnCanvas.Column id="stack" title="Stack"><ColumnCanvas.Body>Commits</ColumnCanvas.Body></ColumnCanvas.Column>
    <ColumnCanvas.Column id="diff" title="Diff"><ColumnCanvas.Body>Changed lines</ColumnCanvas.Body></ColumnCanvas.Column>
  </ColumnCanvas.Root>
</div>`;
