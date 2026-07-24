<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import AccountNavigationLink from "./AccountNavigationLink.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
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
      class="bc-account-navigation-story__card bc-account-navigation-story__card--row"
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
    <output class="bc-account-navigation-story__status" aria-live="polite"
      >{selectedAccount}</output
    >
  {/snippet}
</Story>

<Story name="Makes an unavailable account inert"
>
  {#snippet template()}
    <div class="bc-account-navigation-story__card">
      <AccountNavigationLink
        account="Expenses:Archived"
        label="Archived account"
        disabled
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-account-navigation-story__card {
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-raised);
    padding: var(--ui-beancount-space-5);
  }

  .bc-account-navigation-story__card--row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: calc(var(--ui-beancount-space-3) * 2);
  }

  .bc-account-navigation-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
