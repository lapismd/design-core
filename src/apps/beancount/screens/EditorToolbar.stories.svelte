<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import EditorToolbar from "./EditorToolbar.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Screens/Editor Toolbar",
    component: EditorToolbar,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled Fava-aligned Editor header actions. The host owns editor content, heading state, persistence, and save progress.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let headersCollapsedAll = $state(false);
  let action = $state("");
</script>

<Story
  name="Requests heading and save actions"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse all headings" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Collapse headings requested",
    );
    await expect(
      canvas.getByRole("button", { name: "Expand all headings" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Save ledger" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Save ledger requested",
    );
  }}
>
  {#snippet template()}
    <div class="bc-editor-toolbar-story">
      <EditorToolbar
        {headersCollapsedAll}
        onToggleHeadings={() => {
          headersCollapsedAll = !headersCollapsedAll;
          action = headersCollapsedAll
            ? "Collapse headings requested"
            : "Expand headings requested";
        }}
        onSave={() => {
          action = "Save ledger requested";
        }}
      />
      <output class="bc-editor-toolbar-story__status" aria-live="polite">
        {action}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Disables unavailable save">
  {#snippet template()}
    <div class="bc-editor-toolbar-story">
      <EditorToolbar
        saveDisabled
        onToggleHeadings={() => {}}
        onSave={() => {}}
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-editor-toolbar-story {
    padding: var(--ui-beancount-space-5);
  }

  .bc-editor-toolbar-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
