<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Circle from "@lucide/svelte/icons/circle";
  import { expect, userEvent } from "storybook/test";
  import * as ColumnCanvas from "./index.js";
  import { createColumnCanvasController } from "./column-canvas-controller.svelte.js";

  import { Example, Custom } from "./ColumnCanvasToggle.example-sources.js";

  const { Story } = defineMeta({
    title: "Shadcn/Layout/Column Canvas",
    component: ColumnCanvas.Root,
    parameters: {
      docs: { source: { code: Example, language: "tsx", type: "code" } },
    },
  });
</script>

<script lang="ts">
  const customController = createColumnCanvasController({
    columns: { custom: { defaultWidth: 280, collapsible: true } },
  });
  const controller = createColumnCanvasController({
    columns: { files: { defaultWidth: 280, collapsible: true } },
  });
</script>

<Story
  name="Compact panel toggles"
  play={async ({ canvas }) => {
    const collapse = canvas.getByRole("button", {
      name: "Collapse Files column",
    });
    const icon = collapse.querySelector(
      '[data-ui-component="panel-toggle"][data-ui-part="icon"]',
    );
    await expect(icon).not.toBeNull();
    expect(collapse.getBoundingClientRect().width).toBe(28);
    expect(collapse.getBoundingClientRect().height).toBe(24);
    expect(icon!.getBoundingClientRect().width).toBe(18);
    expect(icon!.getBoundingClientRect().height).toBe(12);
    await userEvent.click(collapse);
    const expand = canvas.getByRole("button", { name: "Expand Files column" });
    await expect(
      expand.querySelector('[data-ui-component="panel-toggle"]'),
    ).not.toBeNull();
    await userEvent.click(expand);
    await expect(
      canvas.getByRole("button", { name: "Collapse Files column" }),
    ).toHaveAttribute("aria-expanded", "true");
  }}
>
  {#snippet template()}
    <div style="width: 600px; height: 240px">
      <ColumnCanvas.Root
        {controller}
        displayMode="fixed"
        aria-label="Files canvas"
      >
        <ColumnCanvas.Column id="files" title="Files">
          <ColumnCanvas.Body>Changed files</ColumnCanvas.Body>
        </ColumnCanvas.Column>
      </ColumnCanvas.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Custom panel toggle icon"
  parameters={{
    docs: { source: { code: Custom, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const toggle = canvas.getByRole("button", {
      name: "Collapse Custom column",
    });
    await expect(canvas.getByTestId("custom-column-icon")).toBeVisible();
    expect(
      toggle.querySelector('[data-ui-component="panel-toggle"]'),
    ).toBeNull();
    await userEvent.click(toggle);
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand Custom column" }),
    );
    await expect(canvas.getByTestId("custom-column-icon")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Collapse Custom column" }),
    ).toHaveAttribute("aria-expanded", "true");
  }}
>
  {#snippet template()}
    <div style="width: 600px; height: 240px">
      <ColumnCanvas.Root
        controller={customController}
        displayMode="fixed"
        aria-label="Custom canvas"
      >
        <ColumnCanvas.Column id="custom" columnTitle="Custom">
          <ColumnCanvas.Header>
            <ColumnCanvas.Title>Custom</ColumnCanvas.Title>
            <ColumnCanvas.HeaderActions>
              <ColumnCanvas.Toggle>
                {#snippet icon(_state)}<Circle
                    data-testid="custom-column-icon"
                    aria-hidden="true"
                  />{/snippet}
              </ColumnCanvas.Toggle>
            </ColumnCanvas.HeaderActions>
          </ColumnCanvas.Header>
          <ColumnCanvas.Body>Custom icon content</ColumnCanvas.Body>
        </ColumnCanvas.Column>
      </ColumnCanvas.Root>
    </div>
  {/snippet}
</Story>
