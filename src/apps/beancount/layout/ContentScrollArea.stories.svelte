<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import ContentScrollArea from "./ContentScrollArea.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Layout/Content Scroll Area",
    component: ContentScrollArea,
    parameters: {
      docs: {
        description: {
          component:
            "A bounded page-body viewport that preserves the shared scroll-area styling. Use it inside [App Shell](?path=/docs/apps-beancount-layout-app-shell--docs) content when a page needs its own scrolling region; it does not introduce table or page layout rules.",
        },
      },
    },
  });

  const ledgerLines = [
    "2026-07-18 open Assets:Cash",
    "2026-07-18 open Expenses:Groceries",
    '2026-07-18 * "Opening balance"',
    "  Assets:Cash              1,250.00 GBP",
    "  Equity:Opening-Balances -1,250.00 GBP",
    '2026-07-19 * "Groceries"',
    "  Expenses:Groceries          42.17 GBP",
    "  Assets:Cash                -42.17 GBP",
  ];
</script>

<Story
  name="Contains a long ledger note"
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Ledger source preview")).toBeVisible();
    await expect(
      canvas.getByRole("region", { name: "Ledger source content" }),
    ).toHaveAttribute("tabindex", "0");
  }}
>
  {#snippet template()}
    <section
      class="bc-content-scroll-area-story"
      aria-label="Ledger source preview"
    >
      <ContentScrollArea
        ariaLabel="Ledger source content"
        contentClass="bc-content-scroll-area-story__content"
      >
        <pre class="bc-content-scroll-area-story__source">{Array.from(
            { length: 4 },
            () => ledgerLines,
          )
            .flat()
            .join("\n")}</pre>
      </ContentScrollArea>
    </section>
  {/snippet}
</Story>

<style>
  .bc-content-scroll-area-story {
    max-width: 36rem;
    height: 12rem;
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--radius-lg);
    background: var(--ui-beancount-surface-raised);
  }

  :global(.bc-content-scroll-area-story__content) {
    padding: var(--ui-beancount-space-4);
  }

  .bc-content-scroll-area-story__source {
    margin: 0;
    color: var(--ui-beancount-foreground);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    line-height: 1.5rem;
  }
</style>
