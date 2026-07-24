<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import AppShellDemo from "./AppShellDemo.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Layout/App Shell",
    component: AppShellDemo,
    parameters: {
      docs: {
        description: {
          component:
            "The application frame for the Beancount Studio app. Use `hasSidebar` when a persistent navigation rail is present; sidebar-free pages retain equal workspace gutters on both sides. For form composition, start with the [Form guidance](?path=/docs/ui-forms-guidance--docs).",
        },
      },
    },
  });
</script>

<Story
  name="Ledger workspace"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Accounts" }));
    await expect(
      canvas.getByRole("heading", { name: "Accounts" }),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Sync ledger" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Syncing Barclays checking account…",
    );
  }}

  parameters={{
    visualDelta: {"images":["/visual-baselines/apps/beancount/layout/ledger-workspace-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1},
  }}
/>
