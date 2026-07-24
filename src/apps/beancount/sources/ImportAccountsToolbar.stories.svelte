<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ImportAccountsToolbar from "./ImportAccountsToolbar.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Sources/Import Accounts Toolbar",
    component: ImportAccountsToolbar,
    parameters: {
      docs: {
        description: {
          component:
            "A controlled Accounts-header sync action matching the Fava Import Accounts reference. The host owns all synchronization state and effects.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let action = $state("");
</script>

<Story
  name="Requests batch synchronization"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Sync all connections" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Sync all");
  }}
>
  {#snippet template()}
    <div class="bc-import-accounts-toolbar-story">
      <ImportAccountsToolbar
        onSyncAll={() => {
          action = "Sync all";
        }}
      />
      <output
        class="bc-import-accounts-toolbar-story__status"
        aria-live="polite">{action}</output
      >
    </div>
  {/snippet}
</Story>

<style>
  .bc-import-accounts-toolbar-story {
    display: flex;
    gap: var(--ui-beancount-space-3);
    padding: var(--ui-beancount-space-5);
  }

  .bc-import-accounts-toolbar-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
