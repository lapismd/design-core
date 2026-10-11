export const HoverPreviews = `<script lang="ts">
  import * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";
  const controller = ColumnCanvas.createColumnCanvasController({
    columns: {
      navigation: { defaultWidth: 280, collapsible: true, collapsed: true },
      content: { defaultWidth: 480 },
    },
  });
</script>

<ColumnCanvas.Root {controller} displayMode="fixed">
  <ColumnCanvas.Column id="navigation" title="Navigation" sticky
    previewOnHover previewDelay={600} previewDismissDelay={120}>
    <ColumnCanvas.Body>
      <ColumnCanvas.Item>Inbox</ColumnCanvas.Item>
      <ColumnCanvas.Item>Archive</ColumnCanvas.Item>
    </ColumnCanvas.Body>
  </ColumnCanvas.Column>
  <ColumnCanvas.Column id="content" title="Content" previewOnHover={false}>
    <ColumnCanvas.Body>Selected content</ColumnCanvas.Body>
  </ColumnCanvas.Column>
</ColumnCanvas.Root>`;
