<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Columns from "@lucide/svelte/icons/columns-2";
  import { PanelToggle } from "./index.js";
  import * as sources from "./PanelToggle.example-sources.js";

  const { Story } = defineMeta({
    title: "Shadcn/Layout/Panel Toggle",
    component: PanelToggle,
    parameters: {
      docs: { source: { code: sources.Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<script lang="ts">
  let leftExpanded = $state(true);
  let rightExpanded = $state(false);
  let customExpanded = $state(true);
</script>

<Story
  name="Left panel"
  play={async ({ canvas }) => {
    const toggle = canvas.getByRole("button", { name: "Toggle files" });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Files collapsed",
    );
    await userEvent.click(toggle);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Files expanded",
    );
  }}
>
  {#snippet template()}
    <div class="flex items-center gap-3">
      <PanelToggle
        expanded={leftExpanded}
        aria-label="Toggle files"
        onclick={() => (leftExpanded = !leftExpanded)}
      />
      <output>Files {leftExpanded ? "expanded" : "collapsed"}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Right panel"
  parameters={{
    docs: { source: { code: sources.Right, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const toggle = canvas.getByRole("button", { name: "Toggle details" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle.querySelector('[data-side="right"]')).not.toBeNull();
    await userEvent.click(toggle);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Details expanded",
    );
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  }}
>
  {#snippet template()}
    <div class="flex items-center gap-3">
      <PanelToggle
        side="right"
        expanded={rightExpanded}
        aria-label="Toggle details"
        onclick={() => (rightExpanded = !rightExpanded)}
      />
      <output>Details {rightExpanded ? "expanded" : "collapsed"}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Disabled panel"
  args={{
    expanded: true,
    disabled: true,
    "aria-label": "Collapse unavailable panel",
  }}
  parameters={{
    docs: { source: { code: sources.Disabled, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const toggle = canvas.getByRole("button", {
      name: "Collapse unavailable panel",
    });
    await expect(toggle).toBeDisabled();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  }}
/>

<Story
  name="Custom icon"
  parameters={{
    docs: { source: { code: sources.Custom, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const toggle = canvas.getByRole("button", { name: "Toggle preview" });
    await expect(
      toggle.querySelector('[data-ui-component="panel-toggle"]'),
    ).toBeNull();
    await userEvent.click(toggle);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Preview collapsed",
    );
  }}
>
  {#snippet template()}
    <div class="flex items-center gap-3">
      <PanelToggle
        expanded={customExpanded}
        aria-label="Toggle preview"
        onclick={() => (customExpanded = !customExpanded)}
      >
        <Columns aria-hidden="true" />
      </PanelToggle>
      <output>Preview {customExpanded ? "expanded" : "collapsed"}</output>
    </div>
  {/snippet}
</Story>
