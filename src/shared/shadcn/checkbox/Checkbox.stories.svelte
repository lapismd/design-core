<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Checkbox } from "./index.js";
  import { Label } from "../label/index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Checkbox",
    component: Checkbox,
    parameters: {
      docs: {
        description: {
          component:
            "UI-owned checkbox for forms and settings. Native CSS conversion via ui:add.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let accepted = $state(false);
</script>

<Story
  name="Default"
  tags={["visual-state", "visual-approved"]}
  parameters={{
    visualDelta: {
      images: ["/visual-baselines/shadcn/checkbox/default-chromium-darwin.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <div class="flex items-center gap-3">
      <Checkbox id="terms-default" checked={true} aria-label="Accept terms" />
      <Label for="terms-default">Accept terms and conditions</Label>
    </div>
  {/snippet}
</Story>

<Story
  name="Toggles a boolean setting"
  play={async ({ canvas }) => {
    const box = canvas.getByRole("checkbox", { name: "Accept terms" });
    await expect(box).not.toBeChecked();
    await userEvent.click(box);
    await expect(box).toBeChecked();
    await expect(canvas.getByRole("status")).toHaveTextContent("accepted");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/checkbox/toggles-a-boolean-setting-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <Checkbox
          id="terms-interactive"
          bind:checked={accepted}
          aria-label="Accept terms"
        />
        <Label for="terms-interactive">Accept terms and conditions</Label>
      </div>
      <output class="text-muted-foreground text-sm">
        {accepted ? "accepted" : "not accepted"}
      </output>
    </div>
  {/snippet}
</Story>
