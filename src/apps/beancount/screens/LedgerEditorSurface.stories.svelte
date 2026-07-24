<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import LedgerEditorSurface from "./LedgerEditorSurface.svelte";
  import { editorPreviewLines } from "./fixtures.js";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
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
  play={async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("Options")).toBeVisible();
    await expect(canvas.getByText('"Account Ledger"')).toBeVisible();
    await expect(canvas.getByText("Equity:Opening-Balances")).toBeVisible();
    await expect(
      canvasElement.querySelector(".bc-ledger-editor-surface__ruler"),
    ).toHaveAttribute("data-visible", "true");
  }}
>
  {#snippet template()}
    <div class="bc-ledger-editor-surface-story">
      <LedgerEditorSurface
        lines={editorPreviewLines}
        activeLineNumber={1}
        rulerColumn={48}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Shows collapsed headings without a currency ruler"
  play={async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("Options")).toBeVisible();
    await expect(canvas.getByText("Accounts")).toBeVisible();
    await expect(
      canvas.queryByText('"Account Ledger"'),
    ).not.toBeInTheDocument();
    await expect(
      canvasElement.querySelector(".bc-ledger-editor-surface__ruler"),
    ).toHaveAttribute("data-visible", "false");
  }}
>
  {#snippet template()}
    <div class="bc-ledger-editor-surface-story">
      <LedgerEditorSurface
        lines={editorPreviewLines}
        headersCollapsedAll
        rulerColumn={0}
      />
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
