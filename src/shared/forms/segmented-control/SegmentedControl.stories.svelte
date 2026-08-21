<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import SegmentedControl from "./SegmentedControl.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Segmented Control",
    component: SegmentedControl,
    parameters: {
      docs: {
        description: {
          component: "Exclusive choice control for two or three values.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("edit");
  let disabledValue = $state("schedule");
</script>

<Story
  name="Changes the selected segment"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Preview" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("preview");
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div class="flex flex-col gap-2">
      <SegmentedControl
        {value}
        options={["edit", "preview"]}
        labels={{ edit: "Edit", preview: "Preview" }}
        ariaLabel="View mode"
        onChange={(next) => (value = next)}
      />
      <output class="text-muted-foreground text-sm">{value}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Disables choices"
  tags={["test", "visual-pending"]}
  play={async ({ canvas }) => {
    const completion = canvas.getByRole("button", { name: "Completion" });
    await expect(completion).toBeDisabled();
    await userEvent.click(completion);
    await expect(canvas.getByRole("status")).toHaveTextContent("schedule");
  }}
>
  {#snippet template()}
    <div class="flex flex-col gap-2">
      <SegmentedControl
        value={disabledValue}
        options={["schedule", "completion"]}
        labels={{ schedule: "Schedule", completion: "Completion" }}
        ariaLabel="Advance from"
        disabled
        onChange={(next) => (disabledValue = next)}
      />
      <output class="text-muted-foreground text-sm">{disabledValue}</output>
    </div>
  {/snippet}
</Story>

<Story name="Shows an error" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="flex flex-col gap-2 p-4">
      <SegmentedControl
        value="edit"
        options={["edit", "preview"]}
        labels={{ edit: "Edit", preview: "Preview" }}
        ariaLabel="View mode"
        error="This field is required."
      />
    </div>
  {/snippet}
</Story>
