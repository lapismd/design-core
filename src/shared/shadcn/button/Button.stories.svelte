<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Button, buttonTokenNames } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Actions/Button",
    component: Button,
    parameters: {
      docs: {
        description: {
          component:
            "Native-CSS shadcn button. Restyle via --ui-button-* tokens on an ancestor (not Tailwind cn() class merges).",
        },
      },
    },
  });
</script>

<script lang="ts">
  let saved = $state(false);
</script>

<Story
  name="Variants and action feedback"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Changes saved");
  }}
  tags={["visual-failed"]}
>
  {#snippet template()}
    <div class="flex flex-wrap items-center gap-3">
      <Button onclick={() => (saved = true)}>Save changes</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Remove</Button>
      <output class="text-muted-foreground basis-full text-sm">
        {saved ? "Changes saved" : "Changes not saved"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Token override (subtree)"
  play={async ({ canvas }) => {
    const branded = canvas.getByRole("button", { name: "Branded primary" });
    await expect(branded).toBeVisible();
    const styles = getComputedStyle(branded);
    await expect(
      styles.getPropertyValue(buttonTokenNames.background).trim(),
    ).toBe("oklch(0.42 0.12 145)");
  }}
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: {
        story:
          "Override --ui-button-* on an ancestor to restyle without Tailwind cn() merges. Tagged skip-visual: token demo only (no committed baseline).",
      },
    },
  }}
>
  {#snippet template()}
    <div
      class="flex flex-wrap items-center gap-3"
      style={`${buttonTokenNames.background}: oklch(0.42 0.12 145); ${buttonTokenNames.foreground}: oklch(0.99 0 0); ${buttonTokenNames.radius}: 9999px;`}
    >
      <Button>Branded primary</Button>
      <Button variant="secondary">Secondary unchanged</Button>
      <Button variant="outline">Outline unchanged</Button>
    </div>
  {/snippet}
</Story>
