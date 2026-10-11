<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, waitFor } from "storybook/test";
  import * as ColumnCanvas from "./index.js";
  import { Root as ColumnCanvasRoot } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Layout/Column Canvas",
    component: ColumnCanvasRoot,
    tags: ["visual-pending"],
  });

  async function expectBothAxes(canvasElement: HTMLElement) {
    const viewport = canvasElement.querySelector<HTMLElement>(
      '[data-ui-part="column-body"] [data-ui-part="scroll-area-viewport"]',
    )!;
    await waitFor(() => {
      expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
      expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    });
    await expect(viewport.parentElement).toHaveAttribute(
      "data-orientation",
      "both",
    );
    viewport.scrollLeft = 120;
    viewport.scrollTop = 160;
    await waitFor(() => {
      expect(viewport.scrollLeft).toBe(120);
      expect(viewport.scrollTop).toBe(160);
    });
    viewport.focus();
    await expect(document.activeElement).toBe(viewport);
  }
</script>

<script lang="ts">
  import { createColumnCanvasController } from "./column-canvas-controller.svelte.js";
  const canvas = createColumnCanvasController({
    columns: { content: { defaultWidth: 320, minWidth: 320, maxWidth: 320 } },
  });
</script>

{#snippet content()}
  <div class="wide-content">Wide, tall column content</div>
{/snippet}

<Story
  name="Native two-axis body"
  play={async ({ canvasElement }) => expectBothAxes(canvasElement)}
>
  {#snippet template()}<div class="bounded-canvas">
      <ColumnCanvas.Root controller={canvas}>
        <ColumnCanvas.Column id="content" title="Content">
          <ColumnCanvas.Body orientation="both" scrollStrategy="native"
            >{@render content()}</ColumnCanvas.Body
          >
        </ColumnCanvas.Column>
      </ColumnCanvas.Root>
    </div>{/snippet}
</Story>

<Story
  name="Styled two-axis body"
  play={async ({ canvasElement }) => expectBothAxes(canvasElement)}
>
  {#snippet template()}<div class="bounded-canvas">
      <ColumnCanvas.Root controller={canvas}>
        <ColumnCanvas.Column id="content" title="Content">
          <ColumnCanvas.Body orientation="both" scrollStrategy="styled"
            >{@render content()}</ColumnCanvas.Body
          >
        </ColumnCanvas.Column>
      </ColumnCanvas.Root>
    </div>{/snippet}
</Story>

<style>
  .bounded-canvas {
    width: 400px;
    height: 360px;
  }
  .wide-content {
    width: 800px;
    height: 900px;
  }
</style>
