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
  name="Default"
  tags={["visual-state", "visual-approved"]}
  parameters={{
    visualDelta: {
      images: ["/visual-baselines/shadcn/switch/default-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="flex items-center gap-3">
      <Switch checked={true} aria-label="Enable notifications" />
      <span class="text-muted-foreground text-sm">Notifications enabled</span>
    </div>
  {/snippet}
</Story>

<Story
  name="Changes a boolean setting"
  tags={["skip-visual"]}
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
