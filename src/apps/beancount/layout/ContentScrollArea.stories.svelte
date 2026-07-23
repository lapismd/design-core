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
  }}
>
  {#snippet template()}
    <section
      class="bg-card h-48 max-w-xl overflow-hidden rounded-lg border"
      aria-label="Ledger source preview"
    >
      <ContentScrollArea contentClass="p-4">
        <pre
          class="text-foreground m-0 font-mono text-xs leading-6">{Array.from(
            { length: 4 },
            () => ledgerLines,
          )
            .flat()
            .join("\n")}</pre>
      </ContentScrollArea>
    </section>
  {/snippet}
</Story>
