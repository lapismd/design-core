<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import DatePicker from "./DatePicker.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Date Picker",
    component: DatePicker,
    parameters: {
      docs: {
        description: {
          component:
            "A controlled date picker with natural-language / semantic date input (chrono-node), a Today shortcut, and a month grid (`TaskDueCalendar`). Value is `YYYY-MM-DD`. See the [Form guidance](?path=/docs/ui-forms-guidance--docs).",
        },
      },
    },
  });
</script>

<script lang="ts">
  let dueDate = $state<string | undefined>();
  let naturalDate = $state<string | undefined>();
</script>

<Story
  name="Selects Today from the popover"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Due date" }));
    const body = within(document.body);
    await userEvent.click(body.getByRole("button", { name: "Today" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "A due date is selected",
    );
  }}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-3 p-5">
      <DatePicker bind:value={dueDate} ariaLabel="Due date" />
      <output class="text-muted-foreground text-sm" aria-live="polite">
        {dueDate ? "A due date is selected" : "No due date selected"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Commits a natural phrase"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Settlement date" }),
    );
    const body = within(document.body);
    const when = body.getByRole("textbox", { name: "When" });
    await userEvent.type(when, "tomorrow");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "A settlement date is selected",
    );
  }}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-3 p-5">
      <DatePicker bind:value={naturalDate} ariaLabel="Settlement date" />
      <output class="text-muted-foreground text-sm" aria-live="polite">
        {naturalDate
          ? "A settlement date is selected"
          : "No settlement date selected"}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Shows a disabled field" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="p-5">
      <DatePicker ariaLabel="Locked settlement date" disabled />
    </div>
  {/snippet}
</Story>

<Story name="Shows an error" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="p-5">
      <DatePicker ariaLabel="Required due date" error="Due date is required" />
    </div>
  {/snippet}
</Story>
