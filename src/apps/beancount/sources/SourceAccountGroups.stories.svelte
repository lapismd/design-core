<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import SourceAccountGroups from "./SourceAccountGroups.svelte";

  const source = {
    id: "lunch-flow",
    name: "Lunch Flow",
    initials: "L",
    credentialLabel: "Credential available · Discovering accounts...",
    syncLabel: "Last sync: Not synced yet",
    tone: "negative" as const,
  };

  const otherAccounts = {
    id: "other-accounts",
    label: "Other Accounts",
    description: "Ledger accounts not assigned to a sync configuration",
    count: 45,
  };

  const sourceActions = [
    { id: "update-logo", label: "Update logo" },
    { id: "sync", label: "Sync" },
    { id: "remove", label: "Remove connection", destructive: true },
  ];

  const { Story } = defineMeta({
    title: "Apps/Beancount/Sources/Source Account Groups",
    component: SourceAccountGroups,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled source-account and unassigned-account rows based on Fava's Accounts screen. Hosts own disclosure, account setup, and sync state.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let opened = $state("");
</script>

<Story
  name="Requests source or unassigned account detail"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Open Lunch Flow accounts" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Opened Lunch Flow",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Open Other Accounts" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Opened Other Accounts",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Lunch Flow actions" }),
    );
    await userEvent.click(
      within(document.body).getByRole("menuitem", { name: "Sync" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Sync Lunch Flow",
    );
  }}
>
  {#snippet template()}
    <div class="bc-source-account-groups-story">
      <SourceAccountGroups
        {source}
        {otherAccounts}
        {sourceActions}
        onOpenSource={(item) => {
          opened = `Opened ${item.name}`;
        }}
        onOpenOtherAccounts={(item) => {
          opened = `Opened ${item.label}`;
        }}
        onSourceAction={(item, action) => {
          opened = `${action.label} ${item.name}`;
        }}
      />
      <output class="bc-source-account-groups-story__status" aria-live="polite"
        >{opened}</output
      >
    </div>
  {/snippet}
</Story>

<style>
  .bc-source-account-groups-story {
    max-width: 72rem;
    padding: var(--ui-beancount-space-5);
  }

  .bc-source-account-groups-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
