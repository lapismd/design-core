<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import RuleList from "./RuleList.svelte";

  const rule = {
    id: "test-rule",
    name: "Test Rule",
    clauses: [
      { id: "condition", kind: "IF" as const, text: "amount > 20" },
      {
        id: "action",
        kind: "THEN" as const,
        text: "Set transaction category to Assets:Checking:Starling",
      },
      {
        id: "schedule",
        kind: "FOR" as const,
        text: "Starting from 2027-03-16",
      },
    ],
  };

  const { Story } = defineMeta({
    title: "Apps/Beancount/Rules/Rule List",
    component: RuleList,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled Fava-aligned rule display. The host owns rule persistence, navigation, action menus, and run history.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let active = $state(true);
  let action = $state("");
</script>

<Story
  name="Requests rule actions and active state"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Test Rule" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Open Test Rule",
    );

    await userEvent.click(
      canvas.getByRole("switch", { name: "Set Test Rule active" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Test Rule inactive",
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "More actions for Test Rule" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "More actions for Test Rule",
    );
  }}
>
  {#snippet template()}
    <div class="bc-rule-list-story">
      <RuleList
        rule={{ ...rule, active }}
        onOpenRule={(item) => {
          action = `Open ${item.name}`;
        }}
        onActiveChange={(item, next) => {
          active = next;
          action = `${item.name} ${next ? "active" : "inactive"}`;
        }}
        onMoreActions={(item) => {
          action = `More actions for ${item.name}`;
        }}
      />
      <output class="bc-rule-list-story__status" aria-live="polite"
        >{action}</output
      >
    </div>
  {/snippet}
</Story>

<style>
  .bc-rule-list-story {
    padding: var(--ui-beancount-space-6);
  }

  .bc-rule-list-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
