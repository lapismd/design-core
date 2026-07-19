<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Switch } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Switch",
    component: Switch,
    parameters: {
      docs: {
        description: {
          component: "UI-owned boolean switch for settings and form toggles.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let enabled = $state(true);
</script>

<Story
  name="Changes a boolean setting"
  play={async ({ canvas }) => {
    const toggle = canvas.getByRole("switch", { name: "Enable notifications" });
    await expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    await expect(toggle).not.toBeChecked();
    await expect(canvas.getByRole("status")).toHaveTextContent("disabled");
  }}
>
  {#snippet template()}
    <div class="flex items-center gap-3">
      <Switch bind:checked={enabled} aria-label="Enable notifications" />
      <output class="text-muted-foreground text-sm">
        Notifications {enabled ? "enabled" : "disabled"}
      </output>
    </div>
  {/snippet}
</Story>
