export const Example = `<script lang="ts">
  import * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";
  import { createColumnCanvasController } from "@lapismd/design-core/shadcn/column-canvas";
  const controller = createColumnCanvasController({
    columns: { files: { defaultWidth: 280, collapsible: true } },
  });
</script>
<ColumnCanvas.Root {controller} displayMode="fixed" aria-label="Files canvas">
  <ColumnCanvas.Column id="files" title="Files">
    <ColumnCanvas.Body>Changed files</ColumnCanvas.Body>
  </ColumnCanvas.Column>
</ColumnCanvas.Root>`;

export const Custom = `<script lang="ts">
  import * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";
  import { createColumnCanvasController } from "@lapismd/design-core/shadcn/column-canvas";
  import Circle from "@lucide/svelte/icons/circle";
  const controller = createColumnCanvasController({ columns: { custom: { defaultWidth: 280, collapsible: true } } });
</script>
<ColumnCanvas.Root {controller} displayMode="fixed" aria-label="Custom canvas">
  <ColumnCanvas.Column id="custom" columnTitle="Custom">
    <ColumnCanvas.Header>
      <ColumnCanvas.Title>Custom</ColumnCanvas.Title>
      <ColumnCanvas.HeaderActions>
        <ColumnCanvas.Toggle>
          {#snippet icon(state)}<Circle aria-hidden="true" />{/snippet}
        </ColumnCanvas.Toggle>
      </ColumnCanvas.HeaderActions>
    </ColumnCanvas.Header>
    <ColumnCanvas.Body>Custom icon content</ColumnCanvas.Body>
  </ColumnCanvas.Column>
</ColumnCanvas.Root>`;
