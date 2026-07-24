<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { FormField } from "@stevejuma/ui/forms";
  import AccountPicker from "./AccountPicker.svelte";

  const accounts = ["Assets:Cash", "Assets:Bank:Current", "Expenses:Groceries"];

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Pickers/Account Picker",
    component: AccountPicker,
    parameters: {
      docs: {
        description: {
          component:
            'A data-driven account selector built on the shared Filter Command Picker. Applications supply account names and persist the selected value. In forms, use it in `FormField as="div" align="center"`.',
        },
      },
    },
  });
</script>

<script lang="ts">
  let account = $state("");
</script>

<Story
  name="Selects an account"
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Source account" }),
    );
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await page.findByRole("option", { name: "Expenses:Groceries" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Expenses:Groceries",
    );
  }}
>
  {#snippet template()}
    <div class="beancount-structured-form bc-account-picker-story__form">
      <FormField label="Source account" as="div" align="center">
        <AccountPicker
          {accounts}
          value={account}
          label="Source account"
          onChange={(value) => {
            account = value;
          }}
        />
      </FormField>
      <output class="bc-account-picker-story__status" aria-live="polite">
        Account: {account || "Not selected"}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Shows an account in read-only mode"
>
  {#snippet template()}
    <div class="beancount-structured-form bc-account-picker-story__form">
      <FormField label="Source account" as="div" align="center">
        <AccountPicker
          {accounts}
          value="Assets:Bank:Current"
          label="Source account"
          readOnly
        />
      </FormField>
    </div>
  {/snippet}
</Story>

<style>
  .bc-account-picker-story__form {
    max-width: 42rem;
  }

  .bc-account-picker-story__status {
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }
</style>
