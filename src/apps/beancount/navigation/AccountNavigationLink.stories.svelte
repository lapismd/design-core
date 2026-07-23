<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import AccountNavigationLink from "./AccountNavigationLink.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Navigation/Account Navigation Link",
    component: AccountNavigationLink,
    parameters: {
      docs: {
        description: {
          component:
            "A display-model account route link with optional account metadata. Supply a resolved appearance and handle navigation in the application; this component deliberately does not read account stores, fetch merchant logos, or construct routes.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let selectedAccount = $state("");
</script>

<Story
  name="Navigates with an account appearance"
  play={async ({ canvas }) => {
    const groceries = canvas.getByRole("link", {
      name: "Household groceries",
    });
    await userEvent.click(groceries);
    await expect(groceries).toHaveAttribute(
      "href",
      "/accounts/Expenses%3AGroceries",
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Expenses:Groceries",
    );
  }}
>
  {#snippet template()}
    <div
      class="bg-card flex flex-wrap items-center gap-6 rounded-xl border p-5"
    >
      <AccountNavigationLink
        account="Expenses:Groceries"
        label="Household groceries"
        href="/accounts/Expenses%3AGroceries"
        appearance={{ color: "#22c55e", icon: "shopping-cart" }}
        onSelect={(account) => {
          selectedAccount = account;
        }}
      />
      <AccountNavigationLink
        account="Assets:Cash"
        href="/accounts/Assets%3ACash"
        onSelect={(account) => {
          selectedAccount = account;
        }}
      />
    </div>
    <output class="sr-only" aria-live="polite">{selectedAccount}</output>
  {/snippet}
</Story>

<Story name="Makes an unavailable account inert">
  {#snippet template()}
    <div class="bg-card rounded-xl border p-5">
      <AccountNavigationLink
        account="Expenses:Archived"
        label="Archived account"
        disabled
      />
    </div>
  {/snippet}
</Story>
