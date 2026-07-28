<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import PowerSearch from "./PowerSearch.svelte";
  import { createDemoLedgerFilterSyntax } from "../demo-ledger-filter-syntax.js";
  import {
    createPowerSearchToken,
    tokensToFilterQuery,
    type PowerSearchToken,
  } from "./power-search.js";

  const { Story } = defineMeta({
    title: "Filter/Power Search",
    component: PowerSearch,
    parameters: {
      docs: {
        description: {
          component:
            "Structured multi-field filter tokens with a field combobox — no CodeMirror. Import from `@stevejuma/ui/filter`.",
        },
      },
    },
  });

  const demoSyntax = createDemoLedgerFilterSyntax();
</script>

<script lang="ts">
  let tokens = $state<PowerSearchToken[]>([
    createPowerSearchToken({
      field: "payee",
      operator: ":",
      value: "Whole Foods",
    }),
  ]);

  let emptyTokens = $state<PowerSearchToken[]>([]);

  const queryPreview = $derived(tokensToFilterQuery(tokens));
</script>

<Story
  name="Add filter via combobox"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Add filter field" });
    await userEvent.click(input);
    await userEvent.type(input, "amount");
    const option = await canvas.findByRole("option", { name: /amount/i });
    await userEvent.click(option);

    const dialog = await waitFor(() =>
      canvas.getByRole("dialog", { name: "Edit filter" }),
    );
    const valueInput = within(dialog).getByRole("spinbutton", {
      name: "Value",
    });
    await userEvent.clear(valueInput);
    await userEvent.type(valueInput, "20");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Apply" }),
    );

    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: "Edit amount filter" }),
      ).toBeInTheDocument();
    });
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <PowerSearch
        tokens={emptyTokens}
        filterSyntax={demoSyntax}
        resultCount="0 results"
        onTokensChange={(next) => {
          emptyTokens = next;
        }}
      />
      <output class="text-muted-foreground mt-2 block text-sm">
        {tokensToFilterQuery(emptyTokens) || "empty"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Edit remove and clear"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Edit payee filter" }),
    );
    const dialog = await waitFor(() =>
      canvas.getByRole("dialog", { name: "Edit filter" }),
    );
    expect(dialog).toBeInTheDocument();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancel" }),
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Remove payee filter" }),
    );
    await expect(
      canvas.queryByRole("button", { name: "Edit payee filter" }),
    ).not.toBeInTheDocument();

    // Re-seed via host state is already empty; add then clear all
    const input = canvas.getByRole("combobox", { name: "Add filter field" });
    await userEvent.click(input);
    await userEvent.type(input, "type");
    await userEvent.click(await canvas.findByRole("option", { name: /type/i }));
    const addDialog = await waitFor(() =>
      canvas.getByRole("dialog", { name: "Edit filter" }),
    );
    const valueBox = within(addDialog).getByRole("combobox", { name: "Value" });
    await userEvent.click(valueBox);
    await userEvent.click(
      await canvas.findByRole("option", { name: /transaction/i }),
    );
    await userEvent.click(
      within(addDialog).getByRole("button", { name: "Apply" }),
    );
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: "Edit type filter" }),
      ).toBeInTheDocument();
    });
    await userEvent.click(canvas.getByRole("button", { name: "Clear all" }));
    await expect(
      canvas.queryByRole("button", { name: "Edit type filter" }),
    ).not.toBeInTheDocument();
  }}
  tags={["visual-approved"]}

  parameters={{
    visualDelta: {"interactions":[{"id":"interaction-23-findByRole","label":"findByRole(\"option\")","src":"/visual-baselines/filter/power-search/edit-remove-and-clear--interaction-23-findByRole-chromium-darwin.png"}],"align":"canvas"},
  }}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <PowerSearch
        {tokens}
        filterSyntax={demoSyntax}
        contentSearchFieldKey="payee"
        resultCount={`${tokens.length} filters`}
        onTokensChange={(next) => {
          tokens = next;
        }}
      />
      <output class="text-muted-foreground mt-2 block text-sm">
        {queryPreview || "empty"}
      </output>
    </div>
  {/snippet}
</Story>
