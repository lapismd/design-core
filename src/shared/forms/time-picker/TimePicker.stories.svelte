<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fireEvent, userEvent } from "storybook/test";
  import TimePicker from "./TimePicker.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Time Picker",
    component: TimePicker,
    parameters: {
      docs: {
        description: {
          component:
            "A controlled time picker wrapping a styled native `<input type=\"time\">` with an optional Clear action. Value is `HH:mm`. See the [Form guidance](?path=/docs/ui-forms-guidance--docs).",
        },
      },
    },
  });
</script>

<script lang="ts">
  let meetingTime = $state<string | undefined>();
  let clearableTime = $state<string | undefined>("09:15");
</script>

<Story
  name="Sets a time via the input"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const input = canvas.getByLabelText("Meeting time");
    await fireEvent.input(input, { target: { value: "14:30" } });
    await expect(canvas.getByRole("status")).toHaveTextContent("14:30");
  }}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-3 p-5">
      <TimePicker bind:value={meetingTime} ariaLabel="Meeting time" />
      <output class="text-muted-foreground text-sm" aria-live="polite">
        {meetingTime ?? "No time selected"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Clears the selected time"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("09:15");
    await userEvent.click(canvas.getByRole("button", { name: "Clear time" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "No time selected",
    );
  }}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-3 p-5">
      <TimePicker bind:value={clearableTime} ariaLabel="Reminder time" />
      <output class="text-muted-foreground text-sm" aria-live="polite">
        {clearableTime ?? "No time selected"}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Shows an error" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="p-5">
      <TimePicker
        ariaLabel="Required start time"
        error="Start time is required"
      />
    </div>
  {/snippet}
</Story>

<Story name="Shows a disabled field" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="p-5">
      <TimePicker ariaLabel="Locked start time" value="08:00" disabled />
    </div>
  {/snippet}
</Story>
