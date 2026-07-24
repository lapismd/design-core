<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import PowerSearch from "./PowerSearch.svelte";
  import { createDemoLedgerFilterSyntax } from "../demo-ledger-filter-syntax.js";
  import {
    createPowerSearchToken,
    type PowerSearchToken,
  } from "./power-search.js";

  const { Story } = defineMeta({
    title: "Filter/Power Search",
    component: PowerSearch,
  });

  const demoSyntax = createDemoLedgerFilterSyntax();
</script>

<script lang="ts">
  let tokens = $state<PowerSearchToken[]>([
    createPowerSearchToken({
      field: "account",
      operator: ":",
      value: "Expenses:Food",
    }),
    createPowerSearchToken({
      field: "amount",
      operator: ">",
      value: "20",
    }),
  ]);

  let contentTokens = $state<PowerSearchToken[]>([]);
</script>

<Story name="With seeded tokens"
  tags={["visual-failed"]}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <PowerSearch
        {tokens}
        filterSyntax={demoSyntax}
        resultCount="12 results"
        onTokensChange={(next) => {
          tokens = next;
        }}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Content search Enter"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Add filter field" });
    await userEvent.click(input);
    await userEvent.type(input, "groceries");
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: "Edit payee filter" }),
      ).toBeInTheDocument();
    });
    expect(canvas.getByText("groceries")).toBeInTheDocument();
  }}

  tags={["visual-failed"]}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <PowerSearch
        tokens={contentTokens}
        filterSyntax={demoSyntax}
        contentSearchFieldKey="payee"
        placeholder="Search payee or add a field…"
        onTokensChange={(next) => {
          contentTokens = next;
        }}
      />
    </div>
  {/snippet}
</Story>

<Story name="Disabled"
  tags={["visual-failed"]}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <PowerSearch
        tokens={[
          createPowerSearchToken({
            field: "payee",
            operator: ":",
            value: "Landlord",
          }),
        ]}
        filterSyntax={demoSyntax}
        disabled
        onTokensChange={() => {}}
      />
    </div>
  {/snippet}
</Story>
