<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AccountAvatar from "./AccountAvatar.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Pickers/Account Avatar",
    component: AccountAvatar,
    parameters: {
      docs: {
        description: {
          component:
            "A Beancount account marker with deterministic fallback, optional metadata icon, and optional merchant logo. It is a domain-specific picker component, not a generic avatar.",
        },
      },
    },
  });
</script>

<Story name="Shows fallback, configured, and merchant appearances">
  {#snippet template()}
    <div class="bc-account-avatar-story">
      <div class="bc-account-avatar-story__item">
        <AccountAvatar account="Assets:Bank:Checking" />
        <span class="bc-account-avatar-story__label">Fallback</span>
      </div>
      <div class="bc-account-avatar-story__item">
        <AccountAvatar
          account="Expenses:Groceries"
          color="#22C55E"
          icon="shopping-cart"
        />
        <span class="bc-account-avatar-story__label">Configured</span>
      </div>
      <div class="bc-account-avatar-story__item">
        <AccountAvatar
          account="Expenses:Coffee"
          merchantLogoUrl="https://invalid.example/logo.svg"
          size="lg"
        />
        <span class="bc-account-avatar-story__label">Logo fallback</span>
      </div>
    </div>
  {/snippet}
</Story>

<style>
  .bc-account-avatar-story {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: calc(var(--ui-beancount-space-3) * 2);
  }

  .bc-account-avatar-story__item {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }

  .bc-account-avatar-story__label {
    font-size: var(--text-sm);
  }
</style>
