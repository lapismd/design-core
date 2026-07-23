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
    <div class="flex flex-wrap items-center gap-6">
      <div class="flex items-center gap-2">
        <AccountAvatar account="Assets:Bank:Checking" />
        <span class="text-sm">Fallback</span>
      </div>
      <div class="flex items-center gap-2">
        <AccountAvatar
          account="Expenses:Groceries"
          color="#22C55E"
          icon="shopping-cart"
        />
        <span class="text-sm">Configured</span>
      </div>
      <div class="flex items-center gap-2">
        <AccountAvatar
          account="Expenses:Coffee"
          merchantLogoUrl="https://invalid.example/logo.svg"
          size="lg"
        />
        <span class="text-sm">Logo fallback</span>
      </div>
    </div>
  {/snippet}
</Story>
