<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import LedgerSettingsNavigation, {
    type LedgerSettingsDestination,
  } from "./LedgerSettingsNavigation.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Navigation/Ledger Settings Navigation",
    component: LedgerSettingsNavigation,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled Fava-aligned ledger settings navigation. Supply the active destination and own routing and disclosure persistence in the application adapter; it does not import a router or application state.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let activeId = $state<LedgerSettingsDestination>("bank-sync");
  let bankSyncExpanded = $state(true);
  let status = $state("");
</script>

<Story
  name="Navigates settings and controls Bank Sync disclosure"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Rules" }));
    await expect(canvas.getByRole("button", { name: "Rules" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Rules");

    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse Bank Sync navigation" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Expand Bank Sync navigation" }),
    ).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(
      canvas.getByRole("button", { name: "Back to ledger navigation" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Back");
  }}
>
  {#snippet template()}
    <div class="bc-ledger-settings-navigation-story">
      <LedgerSettingsNavigation
        {activeId}
        {bankSyncExpanded}
        onBack={() => {
          status = "Back";
        }}
        onNavigate={(destination) => {
          activeId = destination;
          status = destination;
        }}
        onBankSyncExpandedChange={(expanded) => {
          bankSyncExpanded = expanded;
        }}
      />
      <output
        class="bc-ledger-settings-navigation-story__announcement"
        aria-live="polite">{status}</output
      >
    </div>
  {/snippet}
</Story>

<style>
  .bc-ledger-settings-navigation-story {
    display: flex;
    width: 16rem;
    min-height: 26rem;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-sidebar);
    color: var(--ui-beancount-sidebar-foreground);
    padding: var(--ui-beancount-space-3);
  }

  .bc-ledger-settings-navigation-story__announcement {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
