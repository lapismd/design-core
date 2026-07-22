<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import FilterCommandPicker from "./FilterCommandPicker.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Filter Command Picker",
    component: FilterCommandPicker,
    parameters: {
      docs: {
        description: {
          component:
            'The canonical searchable picker for accounts, enum-like values, and filter choices. In forms, place it in `FormField as="div" align="center"` and use `fullWidth`; enable `allowCustom` only when users may supply a value outside the option list. See the [Form guidance](?path=/docs/ui-forms-guidance--docs) for the control-choice rules.',
        },
      },
    },
  });

  const accountOptions = [
    {
      value: "Assets:Cash",
      label: "Assets:Cash",
      description: "Cash on hand",
      accent: "oklch(56% 0.14 160)",
    },
    {
      value: "Expenses:Groceries",
      label: "Expenses:Groceries",
      description: "Food and household shopping",
      accent: "oklch(70% 0.14 75)",
    },
    {
      value: "Liabilities:Card",
      label: "Liabilities:Card",
      description: "Credit card balance",
      accent: "oklch(60% 0.18 25)",
    },
  ];
</script>

<script lang="ts">
  let account = $state("Assets:Cash");
  let accounts = $state(["Assets:Cash", "Expenses:Groceries"]);
  let environmentVariable = $state("");
</script>

<Story
  name="Single selection"
  tags={["skip-visual"]}
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Account" }));
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      page.getByRole("option", { name: /Expenses:Groceries/ }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Expenses:Groceries",
    );
  }}
>
  {#snippet template()}
    <div class="flex flex-col gap-3">
      <FilterCommandPicker
        label="Account"
        value={account}
        options={accountOptions}
        onChange={(value) => {
          account = value;
        }}
      />
      <p class="text-muted-foreground text-sm">
        Selected account:
        <output class="text-foreground font-medium" aria-live="polite"
          >{account || "No account selected"}</output
        >
      </p>
    </div>
  {/snippet}
</Story>

<Story
  name="Multiple full-width selection"
  tags={["skip-visual"]}
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Accounts" }));
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      page.getByRole("option", { name: /Liabilities:Card/ }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Liabilities:Card",
    );
  }}
>
  {#snippet template()}
    <div class="flex max-w-md flex-col gap-3">
      <FilterCommandPicker
        label="Accounts"
        multiple
        values={accounts}
        fullWidth
        options={accountOptions}
        onValuesChange={(values) => {
          accounts = values;
        }}
      />
      <p class="text-muted-foreground text-sm">
        Selected accounts:
        <output class="text-foreground font-medium" aria-live="polite"
          >{accounts.length > 0 ? accounts.join(", ") : "All accounts"}</output
        >
      </p>
    </div>
  {/snippet}
</Story>

<Story
  name="Custom value"
  tags={["skip-visual"]}
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Environment variable" }),
    );
    const page = within(canvasElement.ownerDocument.body);
    const query = page.getByPlaceholderText("Filter environment variable...");
    await userEvent.type(query, "BEANCOUNT_FILE");
    await userEvent.click(page.getByRole("option", { name: /BEANCOUNT_FILE/ }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "BEANCOUNT_FILE",
    );
  }}
>
  {#snippet template()}
    <div class="flex flex-col gap-3">
      <FilterCommandPicker
        label="Environment variable"
        value={environmentVariable}
        allowCustom
        options={[]}
        onChange={(value) => {
          environmentVariable = value;
        }}
      />
      <p class="text-muted-foreground text-sm">
        Selected value:
        <output class="text-foreground font-medium" aria-live="polite"
          >{environmentVariable || "No value selected"}</output
        >
      </p>
    </div>
  {/snippet}
</Story>

<Story name="Shows an error" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="flex flex-col gap-3 p-4">
      <FilterCommandPicker
        label="Account"
        value=""
        options={accountOptions}
        error="This field is required."
      />
    </div>
  {/snippet}
</Story>
