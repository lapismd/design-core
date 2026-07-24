<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import MerchantPicker from "./MerchantPicker.svelte";

  const merchants = [
    {
      merchantId: "northstar-cafe",
      canonicalName: "Northstar Cafe",
      domain: "northstar-cafe.example",
      description: "Coffee and lunch purchases",
      aliases: [{ normalizedValue: "NORTHSTAR CAFE LONDON" }],
    },
    {
      merchantId: "grocerly",
      canonicalName: "Grocerly",
      domain: "grocerly.example",
      description: "Household shopping",
      aliases: [{ normalizedValue: "GROCERLY MARKET" }],
    },
  ];

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Pickers/Merchant Picker",
    component: MerchantPicker,
    parameters: {
      docs: {
        description: {
          component:
            'A data-driven adapter around the shared Filter Command Picker for saved merchants. Applications supply the ordered merchant records, loading and persistence, and any create-from-search action. In editable forms, put it in `FormField as="div" align="center"`; the picker is full width.',
        },
      },
    },
  });
</script>

<script lang="ts">
  let merchantId = $state("");
  let attachedMerchant = $state("Not selected");
  let createdMerchant = $state("No search action selected");
</script>

<Story
  name="Selects a saved merchant"
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Merchant" }));
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await page.findByRole("option", { name: /Grocerly/ }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Grocerly");
  }}
>
  {#snippet template()}
    <div class="bc-merchant-picker-story__form">
      <MerchantPicker
        {merchants}
        value={merchantId}
        emptyOption={{
          label: "No merchant selected",
          description: "Leave this source without a saved merchant.",
        }}
        onChange={(value) => {
          merchantId = value;
        }}
        onAttach={(merchant) => {
          attachedMerchant = merchant.canonicalName;
        }}
      />
      <output class="bc-merchant-picker-story__status" aria-live="polite">
        Attached merchant: {attachedMerchant}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Offers an application-owned search action"
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Merchant" }));
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.type(
      page.getByPlaceholderText("Search merchants..."),
      "corner-shop.example",
    );
    await userEvent.click(
      await page.findByRole("option", { name: /Create corner-shop\.example/ }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "corner-shop.example",
    );
  }}
>
  {#snippet template()}
    <div class="bc-merchant-picker-story__form">
      <MerchantPicker
        {merchants}
        searchAction={(search) => ({
          label: `Create ${search} with Brand Match`,
          description: "The application can save a merchant with its logo.",
        })}
        searchActionGroupLabel="Brand Match"
        onSearchAction={(search) => {
          createdMerchant = search;
        }}
      />
      <output class="bc-merchant-picker-story__status" aria-live="polite">
        Requested merchant: {createdMerchant}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Shows the selected merchant in read-only mode"
>
  {#snippet template()}
    <div class="bc-merchant-picker-story__read-only">
      <MerchantPicker {merchants} value="northstar-cafe" readOnly />
    </div>
  {/snippet}
</Story>

<style>
  .bc-merchant-picker-story__form {
    display: flex;
    max-width: 42rem;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-merchant-picker-story__status {
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }

  .bc-merchant-picker-story__read-only {
    max-width: 42rem;
  }
</style>
