<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import RuleList, { type RuleSort } from "./RuleList.svelte";

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

  const rules = [
    { ...rule, active: true },
    {
      id: "rent-rule",
      name: "Rent recurring payment",
      active: false,
      clauses: [
        { id: "condition", kind: "IF" as const, text: "payee is Rentwell" },
        {
          id: "action",
          kind: "THEN" as const,
          text: "Set transaction category to Expenses:Home:Rent",
        },
        {
          id: "schedule",
          kind: "FOR" as const,
          text: "All imported transactions",
        },
      ],
    },
  ];

  const actions = [
    { id: "edit", label: "Edit" },
    { id: "run", label: "Run…" },
    { id: "delete", label: "Delete", destructive: true },
  ];

  const runs = [
    {
      id: "run-2026-07-24",
      dateTime: "24 Jul 2026, 09:15",
      executionType: "Manual",
      target: "Live ledger",
      status: "Completed",
      statusTone: "positive" as const,
      ruleName: "Test Rule",
      queued: "12",
      processed: "12",
      modified: "3",
      blocked: "0",
    },
  ];

  const { Story } = defineMeta({
    title: "Apps/Beancount/Rules/Rule List",
    component: RuleList,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled Fava-aligned rule collection. The host owns ordering, persistence, navigation, action menus, and run history.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let activeByRuleId = $state<Record<string, boolean>>({
    "test-rule": true,
    "rent-rule": false,
  });
  let action = $state("");
  let sort = $state<RuleSort>({ key: "name", direction: "asc" });

  const displayedRules = $derived(
    rules.map((rule) => ({ ...rule, active: activeByRuleId[rule.id] })),
  );
</script>

<Story
  name="Requests rule actions and active state"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Edit rule Test Rule" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Open Test Rule",
    );

    await userEvent.click(
      canvas.getByRole("switch", { name: "Deactivate Test Rule" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Test Rule inactive",
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "More actions for Test Rule" }),
    );
    await userEvent.click(
      within(document.body).getByRole("menuitem", { name: "Run…" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Run Test Rule");

    await userEvent.click(
      canvas.getByRole("button", { name: "Sort by active status" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Sort by active status" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Sort active ascending",
    );
  }}
>
  {#snippet template()}
    <div class="bc-rule-list-story">
      <RuleList
        rules={displayedRules}
        {actions}
        {sort}
        onOpenRule={(item) => {
          action = `Open ${item.name}`;
        }}
        onActiveChange={(item, next) => {
          activeByRuleId = { ...activeByRuleId, [item.id]: next };
          action = `${item.name} ${next ? "active" : "inactive"}`;
        }}
        onActionSelect={(item, selectedAction) => {
          action = `${selectedAction.label.replace("…", "")} ${item.name}`;
        }}
        onSortRequest={(key) => {
          const direction =
            sort.key === key && sort.direction === "asc" ? "desc" : "asc";
          sort = { key, direction };
          action = `Sort ${key} ${direction === "asc" ? "ascending" : "descending"}`;
        }}
      />
      <output class="bc-rule-list-story__status" aria-live="polite"
        >{action}</output
      >
    </div>
  {/snippet}
</Story>

<Story
  name="Displays deterministic run history"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("table", { name: "Rules execution history" }),
    ).toBeVisible();
    await expect(canvas.getByText("24 Jul 2026, 09:15")).toBeVisible();
    await expect(canvas.getByText("Completed")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-rule-list-story">
      <RuleList {rules} {actions} {runs} />
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
