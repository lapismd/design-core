<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import IntervalTreeTable, {
    type IntervalTreeColumn,
    type IntervalTreeNode,
  } from "./IntervalTreeTable.svelte";

  const columns = [
    {
      id: "june",
      label: "Jun 2026",
      title: "1 June – 1 July 2026",
      href: "/accounts/Expenses?time=Jun",
    },
    {
      id: "july",
      label: "Jul 2026",
      title: "1 July – 1 August 2026",
      href: "/accounts/Expenses?time=Jul",
    },
  ] satisfies readonly IntervalTreeColumn[];

  const nodes = [
    {
      id: "expenses",
      label: "Expenses",
      href: "/accounts/Expenses",
      cells: {
        june: {
          values: [
            {
              value: "£250.00",
              title: "Pounds sterling",
              difference: {
                value: "(+£30.00)",
                title: "Budget £280.00",
                tone: "positive",
              },
            },
          ],
          collapsedValues: [
            {
              value: "£560.00",
              title: "Pounds sterling",
              difference: {
                value: "(+£40.00)",
                title: "Budget £600.00",
                tone: "positive",
              },
            },
          ],
        },
        july: {
          values: [
            {
              value: "£310.00",
              title: "Pounds sterling",
              difference: {
                value: "(+£10.00)",
                title: "Budget £320.00",
                tone: "positive",
              },
            },
          ],
        },
      },
      children: [
        {
          id: "expenses-groceries",
          label: "Groceries",
          href: "/accounts/Expenses:Groceries",
          cells: {
            june: {
              values: [
                {
                  value: "£180.00",
                  difference: {
                    value: "(+£20.00)",
                    title: "Budget £200.00",
                    tone: "positive",
                  },
                },
              ],
            },
            july: {
              values: [
                {
                  value: "£210.00",
                  difference: {
                    value: "(+£10.00)",
                    title: "Budget £220.00",
                    tone: "positive",
                  },
                },
              ],
            },
          },
        },
        {
          id: "expenses-dining",
          label: "Dining",
          href: "/accounts/Expenses:Dining",
          cells: {
            june: {
              values: [
                {
                  value: "£70.00",
                  difference: {
                    value: "(−£10.00)",
                    title: "Budget £80.00",
                    tone: "negative",
                  },
                },
              ],
            },
            july: {
              values: [
                {
                  value: "£100.00",
                  difference: {
                    value: "(−£0.00)",
                    title: "Budget £100.00",
                    tone: "negative",
                  },
                },
              ],
            },
          },
        },
      ],
    },
    {
      id: "expenses-unused",
      label: "Unused category",
      cells: {
        june: { values: [], dimmed: true },
        july: { values: [], dimmed: true },
      },
    },
  ] satisfies readonly IntervalTreeNode[];

  const { Story } = defineMeta({
    title: "Apps/Beancount/Tables/Interval Tree Table",
    component: IntervalTreeTable,
    parameters: {
      docs: {
        description: {
          component:
            "A display-model-driven, multi-period account comparison. Pass formatted direct and collapsed roll-up amounts plus budget variance state per period; applications remain responsible for date ranges, currency formatting, account visibility, routes, and persisted disclosure preferences. Use `accountCell` for an application-specific account link with contextual content such as an avatar; that renderer owns its navigation.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let selected = $state("");
</script>

{#snippet accountCell(node: IntervalTreeNode)}
  {#snippet contents()}
    <span
      class="bg-primary/15 text-primary grid size-4 shrink-0 place-items-center rounded-full text-[0.55rem]"
      aria-hidden="true"
    >
      {node.label.slice(0, 1)}
    </span>
    <span class="min-w-0 truncate">{node.label}</span>
  {/snippet}

  {#if node.href}
    <a
      href={node.href}
      class="text-foreground hover:text-primary inline-flex min-w-0 items-center gap-2 font-medium"
    >
      {@render contents()}
    </a>
  {:else}
    <span class="inline-flex min-w-0 items-center gap-2 font-medium">
      {@render contents()}
    </span>
  {/if}
{/snippet}

<Story
  name="Compares periods and preserves account disclosure"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse Expenses" }),
    );
    await expect(
      canvas.queryByRole("link", { name: "Groceries" }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByText("£560.00")).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "Expand Expenses" }),
    );
    await expect(canvas.getByRole("link", { name: "Groceries" })).toBeVisible();
    await expect(canvas.getByText("£250.00")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="max-w-5xl p-5">
      <IntervalTreeTable {nodes} {columns} />
    </div>
  {/snippet}
</Story>

<Story name="Supports contextual account links">
  {#snippet template()}
    <div class="max-w-5xl p-5">
      <IntervalTreeTable {nodes} {columns} {accountCell} />
    </div>
  {/snippet}
</Story>

<Story
  name="Reports selected accounts"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("link", { name: "Dining" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Selected Dining",
    );
  }}
>
  {#snippet template()}
    <div class="max-w-5xl p-5">
      <IntervalTreeTable
        {nodes}
        {columns}
        onNavigate={(node) => {
          selected = node.label;
        }}
      />
      <output class="sr-only" aria-live="polite">
        {selected ? `Selected ${selected}` : "No account selected"}
      </output>
    </div>
  {/snippet}
</Story>
