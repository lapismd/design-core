<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import CycleSelect from "./CycleSelect.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Navigation/Cycle Select",
    component: CycleSelect,
    parameters: {
      docs: {
        description: {
          component:
            "A compact previous/next navigator with a searchable selector for a small ordered set, such as reporting periods. It owns the cycling behaviour; use Filter Command Picker directly for an ordinary searchable choice. See [UI Forms guidance](?path=/docs/ui-forms-guidance--docs) for picker selection rules.",
        },
      },
    },
  });

  const periods = [
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "quarter", label: "This quarter" },
  ];
</script>

<script lang="ts">
  let period = $state("week");
</script>

<Story
  name="Cycles reporting periods"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Next period" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("This month");
    await userEvent.click(
      canvas.getByRole("button", { name: "Previous period" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("This week");
  }}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-3">
      <CycleSelect
        value={period}
        options={periods}
        label="Period"
        onChange={(value) => {
          period = value;
        }}
      />
      <output class="text-muted-foreground text-sm" aria-live="polite">
        Viewing: {periods.find((item) => item.value === period)?.label}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Disables unavailable navigation">
  {#snippet template()}
    <CycleSelect
      value="week"
      options={periods}
      label="Period"
      disabled
      onChange={() => {}}
    />
  {/snippet}
</Story>
