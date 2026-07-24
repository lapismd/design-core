<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import LedgerEditorSurface from "./LedgerEditorSurface.svelte";
  import { editorPreviewLines } from "./fixtures.js";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Screens/Ledger Editor Surface",
    component: LedgerEditorSurface,
    parameters: {
      docs: {
        description: {
          component:
            "Display-ready Fava-aligned ledger source surface. The application adapter supplies tokenized lines and owns parsing, editing, selection, persistence, and CodeMirror.",
        },
      },
    },
  });
</script>

<Story
  name="Displays tokenized ledger source"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Options")).toBeVisible();
    await expect(canvas.getByText('"Account Ledger"')).toBeVisible();
    await expect(canvas.getByText("Equity:Opening-Balances")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-ledger-editor-surface-story">
      <LedgerEditorSurface lines={editorPreviewLines} activeLineNumber={1} />
    </div>
  {/snippet}
</Story>

<Story
  name="Shows collapsed source headings"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Options")).toBeVisible();
    await expect(canvas.getByText("Accounts")).toBeVisible();
    await expect(
      canvas.queryByText('"Account Ledger"'),
    ).not.toBeInTheDocument();
  }}
>
  {#snippet template()}
    <div class="bc-ledger-editor-surface-story">
      <LedgerEditorSurface lines={editorPreviewLines} headersCollapsedAll />
    </div>
  {/snippet}
</Story>

<style>
  .bc-ledger-editor-surface-story {
    height: 45rem;
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
  }
</style>
